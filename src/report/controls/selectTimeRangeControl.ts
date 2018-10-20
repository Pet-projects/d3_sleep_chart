import {Control} from "./control";
import {ControlsListener} from "./controlsListener";
import {AppendableSelection, DataArray, DataRow, PositionWithinSelectionRange} from "../domain"
import {UrlParameters} from '../utils/urlParameters';
import * as d3 from "d3";
import * as noUiSlider from "nouislider"

const MINUTES_IN_HOUR = 60;
const MINUTES_IN_HALF_HOUR = 30;

export class CandidateTimeCutoff {
    from: number;
    to: number;

    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
    }

    toString(): string {
        return "[" + this.from + "," + this.to + "]";
    }

    static DEFAULT(): CandidateTimeCutoff {
        return new CandidateTimeCutoff(0, 300);
    }
}

/**
 * Filters the data based on total time it took to complete challenge
 */
export class SelectTimeRangeControl implements Control {
    candidateTimeCutoff: CandidateTimeCutoff;
    timeRangeSlider: AppendableSelection;
    sliderScale: d3.ScaleLogarithmic<any, any>;
    rangeWidth: number = 500;
    slider: noUiSlider.Instance;
    sliderPipMinPadding: number = 25;
    controlsListener: ControlsListener;

    constructor(timeRangeSlider: AppendableSelection) {
        this.timeRangeSlider = timeRangeSlider;

        //TODO read the width from the existing component
        this.timeRangeSlider.style("width", this.rangeWidth + "px");

        this.slider = this.timeRangeSlider.node();
    }

    registerListener(controlsListener: ControlsListener) {
        this.controlsListener = controlsListener;
    }

    updateVisualsWithNewData(data: DataArray) {
        let self = this;

        this.candidateTimeCutoff = new CandidateTimeCutoff(UrlParameters.getRangeFrom(), UrlParameters.getRangeTo());

        let minValue = SelectTimeRangeControl.floorTo(MINUTES_IN_HALF_HOUR, d3.min(data, d => d.Total));
        let maxValue = SelectTimeRangeControl.ceilTo(MINUTES_IN_HALF_HOUR, d3.max(data, d => d.Total));

        let range = {
            'min': minValue,
            'max': maxValue
        };

        // Map pip values to percentage positions on slider.
        let pipPosition = {};
        pipPosition[minValue] = 0;
        pipPosition[maxValue] = 100;

        console.log("range.min:" + range.min);
        console.log("range.max:" + range.max);

        // Ensure that we do not compute log(0) = NaN
        let minSliderDomain = Math.max(1, minValue);

        // Map the values to the scale
        this.sliderScale = d3.scaleLog()
            .domain([minSliderDomain, maxValue])
            .range([0, 1000]);

        d3.range(minValue + MINUTES_IN_HALF_HOUR, maxValue, MINUTES_IN_HALF_HOUR).forEach(value => {
            let position = this.sliderScale(value)/10;
            range[position + '%'] = value;
            pipPosition[value] = position;
        });

        noUiSlider.create(this.timeRangeSlider.node() as HTMLElement, {
            start: [this.candidateTimeCutoff.from, this.candidateTimeCutoff.to],
            connect: true,
            range: range,
            tooltips: [true, true],
            format: {
                to: function (value) {
                    return SelectTimeRangeControl.formatMinutes(value);
                },
                from: function(value) {
                    return value;
                }
            },
            pips: {
                mode: 'steps',
                stepped: true,
                filter: function(value) {
                    return SelectTimeRangeControl.isHour(value)
                        ? noUiSlider.PipFilterResult.LargeValue
                        : SelectTimeRangeControl.isHalfHour(value)
                            ? noUiSlider.PipFilterResult.SmallValue
                            : noUiSlider.PipFilterResult.NoValue;
                },
                format: {
                    to: function(value) {
                        let valuePos = pipPosition[value],
                            prevValuePos = pipPosition[value-MINUTES_IN_HALF_HOUR];

                        let tooClose = (valuePos - prevValuePos) * self.rangeWidth / 100 < self.sliderPipMinPadding;
                        if (tooClose) {
                            // Pips became too clustered - do not show minutes pips from now on.
                            let closestHalfHour = value + (SelectTimeRangeControl.isHour(value) ? MINUTES_IN_HALF_HOUR : 0);
                            for (let halfHour = closestHalfHour; halfHour <= maxValue; halfHour += MINUTES_IN_HOUR) {
                                pipPosition[halfHour] = pipPosition[halfHour-MINUTES_IN_HALF_HOUR];
                            }

                            // Do not display current pip value and don't consider it for next check.
                            pipPosition[value] = prevValuePos;
                            return '';
                        }

                        let hours = Math.floor(value / MINUTES_IN_HOUR);
                        return SelectTimeRangeControl.isHour(value)
                            ? hours + 'h'
                            : Math.floor(value - (hours * MINUTES_IN_HOUR)) + 'm'
                    }
                }
            }
        } as noUiSlider.Options);

        this.slider = this.timeRangeSlider.node() as noUiSlider.Instance;

        this.slider.noUiSlider.on("set", () => {
            let values = this.slider.noUiSlider.get(),
                from = values[0],
                to = values[1];

            this.candidateTimeCutoff.from = SelectTimeRangeControl.parseMinutes(from);
            this.candidateTimeCutoff.to = SelectTimeRangeControl.parseMinutes(to);

            UrlParameters.setRangeFrom(this.candidateTimeCutoff.from);
            UrlParameters.setRangeTo(this.candidateTimeCutoff.to);

            console.log("[Controls] candidateTimeCutoff: " + this.candidateTimeCutoff);
            self.controlsListener.controlsChanged();
        });
    }

    enrichData(d: DataRow) {
        d._previousPositionWithinSelectionRange = d._positionWithinSelectionRange;
        d._positionWithinSelectionRange =
            d.Total < this.candidateTimeCutoff.from
            ? PositionWithinSelectionRange.FASTER
            : d.Total > this.candidateTimeCutoff.to
            ? PositionWithinSelectionRange.SLOWER
            : PositionWithinSelectionRange.WITHIN;
    }

    // TODO Move to separate utils class
    static formatMinutes(d: number) {
        let hours = Math.floor(d / 60),
            minutes = Math.floor(d - (hours * 60));
        let output = '';
        if (minutes) {
            output = minutes + 'm' + output;
        }
        if (hours) {
            output = hours + 'h ' + output;
        }
        return output;
    }

    static parseMinutes(v: string) {
        let timePattern = /(\d{1,2}h)?[ ]?(\d{1,2}m)?/g;
        let parsed = timePattern.exec(v);
        let hours = parsed[1] ? Number(parsed[1].replace(/[h]/g,'')) : 0;
        let minutes = parsed[2] ? Number(parsed[2].replace(/[m]/g,'')) : 0;
        return hours * MINUTES_IN_HOUR + minutes;
    }

    static isHour(value: number) {
        return value % MINUTES_IN_HOUR === 0;
    }

    static isHalfHour(value: number) {
        return value % MINUTES_IN_HALF_HOUR === 0;
    }

    static floorTo(base: number, n: number) {
        return Math.floor(n / base) * base;
    }

    static ceilTo(base: number, n: number) {
        return Math.ceil(n / base) * base;
    }

}
