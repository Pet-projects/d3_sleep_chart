import {
    AppendableSelection,
    UpdatableSelection,
    DataArray,
    DataRow,
    TransitionCoordinator,
    DaysDataSource, DayDataRow, Activity, ActivityType
} from "../domain";
import {VisualComponent} from './visualComponent';
import * as d3 from "d3";
import {formatMinutesAsPrettyString, timestampToHourAndMinutes} from "../utils/time";
import {ColourCode} from "../colourCode";

type XScale = d3.ScaleLinear<number, number>
type YScale = d3.ScaleBand<string>

//Debt the data columns are duplicated. There should be one module describing the domain
let dataColumns = ["R1", "X1", "R2", "X2", "R3", "X3", "R4", "X4", "R5", "X5", "Est"];

const MARGIN = {
    top: 50,
    right: 1,
    bottom: 30,
    left: 200
};
const ROW_HEIGHT = 20;

export class SleepChart implements VisualComponent {
    private svg: AppendableSelection;
    private svgWidth: number;
    private width: number;
    private canvas: AppendableSelection;
    private gTopAxis: AppendableSelection;
    private gTopAxisInfoRect: AppendableSelection;
    private gTopAxisInfoText: AppendableSelection;
    private gBottomAxis: AppendableSelection;
    private gBottomAxisInfoRect: AppendableSelection;
    private gBottomAxisInfoText: AppendableSelection;
    private candidateComponents: ChartComponent[];

    constructor(chart: AppendableSelection) {
        this.svgWidth = chart.node().getBoundingClientRect().width;
        this.width = this.svgWidth - MARGIN.left - MARGIN.right;

        this.svg = chart.append('svg')
            .attr("width", this.svgWidth);
        let g = this.svg.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

        //The top axis is static and can be initialised here
        this.gTopAxis = g.append("g")
            .attr("id", "top-axis");

        this.gTopAxis.append("text")
            .attr("transform", "translate(" + this.width / 2 + ", -20)")
            .style("fill", "#000")
            .style("text-anchor", "end")
            .text("Time spent");

        let gTopAxisInfo = g.append("g");
        this.gTopAxisInfoRect = gTopAxisInfo.append('rect').attr("transform", "translate(3, 3)").style('opacity', 1).style('fill', 'white');
        this.gTopAxisInfoText = gTopAxisInfo.append('text').attr("transform", "translate(5, 15)");

        this.gBottomAxis = g.append("g")
            .attr("id", "bottom-axis");

        let gBottomAxisInfo = g.append('g');
        this.gBottomAxisInfoRect = gBottomAxisInfo.append('rect').style('opacity', 1).style('fill', 'white');
        this.gBottomAxisInfoText = gBottomAxisInfo.append("text");

        //TODO add a legend

        //Canvas comes before the axis
        this.canvas = g.append("g")
            .attr("id", "canvas");

        this.candidateComponents = [
            new DayLabel(),
            new DayEvents()
        ];
    }

    render(wholeDataSet: DaysDataSource, t: TransitionCoordinator) {
        let dataSelection = wholeDataSet.daysData;
        //     .filter(d =>
        //         (!d._showOnlyMatchingCategory || d._selectedCandidate || d._selectedBenchmark) &&
        //         d._positionWithinSelectionRange === PositionWithinSelectionRange.WITHIN &&
        //         d._selectedLanguage)
        //     .sort((a, b) => {
        //         let compareTotal = a.Total - b.Total,
        //             compareFirstRound = a["R1"] - b["R1"];
        //         return a.Total != b.Total ? compareTotal : compareFirstRound;
        //     });

        // Update the activities for each day based on the controls
        let wholeActivityTree = wholeDataSet.activityTree;
        dataSelection.forEach((d: DayDataRow) => {
            // Get all activities for day
            let activitiesForDay = wholeActivityTree.search(d.dayStartEpoch, d.dayEndEpoch);

            // Adjust start and end time
            d._activities = activitiesForDay.map(a =>
                new Activity(Math.max(a.startTimeEpoch, d.dayStartEpoch), Math.min(a.endTimeEpoch, d.dayEndEpoch), a.type)
            )
        });

        // Update container height
        let height = ROW_HEIGHT * dataSelection.length;
        this.svg.transition(t).attr("height", height + MARGIN.top + MARGIN.bottom);

        //~~~~~ Bind axes

        let x = d3.scaleLinear().range([0, this.width]);
        let firstRecord = dataSelection[0];
        let maxValue = firstRecord.dayEndEpoch - firstRecord.dayStartEpoch;
        x.domain([0, maxValue] as Array<number>).nice();

        let y = d3.scaleBand().rangeRound([0, height]).padding(0.1).paddingOuter(1);
        y.domain(dataSelection.map((d: DayDataRow) => d.dayLabel));

        //~~~~ Create nodes for new candidates

        let candidate = this.canvas.selectAll("g.dayRow")
            .data(dataSelection, (d: DayDataRow) => d.dayLabel);

        let candidateEnter = candidate.enter()
            .append("g").attr("class", "dayRow")
            .attr("transform",
                (d: DayDataRow, i) => "translate(0," + (y(d.dayLabel) + height) + ")")
            .call((s) => this.candidateComponents.forEach(comp => comp.create(s, x, y)));

        let candidateUpdate = candidate.merge(candidateEnter);
        candidateUpdate.transition(t)
            .attr("transform",
                (d: DayDataRow, i) => "translate(0," + (d._y0 = y(d.dayLabel)) + ")")
            .call((s) => this.candidateComponents.forEach(comp => comp.update(s, x, y)));

        candidate.exit().transition(t)
            .attr("transform", (d: DayDataRow) => `translate(0, ${d._y0 + height})`)
            .call((s) => this.candidateComponents.forEach(comp => comp.remove(s, x, y)))
            .remove();

        //~~~~ Update the axis

        let axisQuadrants = 24;
        let tickStep = Math.round(maxValue / axisQuadrants);
        let tickValues = d3.range(0, maxValue + 1, tickStep);

        this.gTopAxis.transition(t)
            .call(d3.axisTop(x)
                .tickFormat((numberLike, index) =>
                    timestampToHourAndMinutes(firstRecord.dayStartEpoch + numberLike.valueOf()))
                .tickValues(tickValues)
                .tickSize(-height) as any);

        this.gBottomAxis.transition(t)
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat((numberLike, index) =>
                    timestampToHourAndMinutes(firstRecord.dayStartEpoch + numberLike.valueOf()))
                .tickValues(tickValues)
                .tickSize(0));
    }
}

interface ChartComponent {
    create(selection: AppendableSelection, x: XScale, y: YScale)

    update(selection: UpdatableSelection, x: XScale, y: YScale)

    remove(selection: UpdatableSelection, x: XScale, y: YScale)
}

class DayLabel implements ChartComponent {

    create(selection: AppendableSelection, x: XScale, y: YScale) {
        selection.append("text").attr("class", "label candidate")
            .style("opacity", 1)
            .attr("x", -180)
            .attr("y", y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text((d: DayDataRow) => d.dayLabel);

        selection.append("text").attr("class", "label benchmark")
            .style("opacity", 1)
            .attr("x", -90)
            .attr("y", y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr('fill', '#82929f')
            .text((d: DayDataRow) => `| ${0}`);

        selection.append('rect').attr("class", "label")
            .style("fill", 'none')
            .attr('stroke', '#d7e2e8')
            .attr("x", r => -190)
            .attr("width", r => 190)
            .attr("height", y.bandwidth());
    }

    update(selection: UpdatableSelection, x: XScale, y: YScale) {
        selection.select("text.label")
            .style("opacity", 1)
    }

    remove(selection: UpdatableSelection, x: XScale, y: YScale) {
        selection.select("text.label")
            .style("opacity", 0)
    }
}


class VisualActivity {

    constructor(id: string, x: number, width: number, type: ActivityType) {
        this.id = id;
        this.x = x;
        this.width = width;
        this.type = type;
    }

    id: string;
    x: number;
    width: number;
    type: ActivityType;
}

class DayEvents implements ChartComponent {

    create(selection: AppendableSelection, x: XScale, y: YScale) {
        let rounds = selection.selectAll("rect.dayEvents")
            .data((d: DayDataRow) =>
                    d._activities.map(a => new VisualActivity(
                        a.startTimeEpoch+"",
                        a.startTimeEpoch-d.dayStartEpoch,
                        a.endTimeEpoch - a.startTimeEpoch,
                        a.type)),
                (va:VisualActivity) => va.id);

        rounds.enter()
            .insert("rect").attr("class", "dayEvents")
            .style("opacity", 0)
            .style("fill", (va:VisualActivity) => ColourCode.forActivity(va.type))
            .attr("x", (va:VisualActivity) => x(va.x))
            .attr("width", (va:VisualActivity)  => x(va.width))
            .attr("height", y.bandwidth());
    }

    update(selection: UpdatableSelection, x: XScale, y: YScale) {
        selection.selectAll("rect.dayEvents")
            .style("opacity", 1)
            .attr("x", (va:VisualActivity) => x(va.x))
            .attr("width", (va:VisualActivity) => x(va.width))
            .attr("height", y.bandwidth());
    }

    remove(selection: UpdatableSelection, x: XScale, y: YScale) {
        selection.selectAll("rect.dayEvents")
            .style("opacity", 0)
    }
}



