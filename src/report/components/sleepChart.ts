import {
    AppendableSelection,
    UpdatableSelection,
    DataArray,
    DataRow,
    TransitionCoordinator,
    PositionWithinSelectionRange,
    DaysDataSource
} from "../domain";
import {VisualComponent} from './visualComponent';
import * as d3 from "d3";
import {formatMinutes} from "../utils/time";
import {ColourCode} from "../colourCode";

type XScale = d3.ScaleLinear<number, number>
type YScale = d3.ScaleBand<string>

//Debt the data columns are duplicated. There should be one module describing the domain
let dataColumns = ["R1", "X1", "R2", "X2", "R3", "X3", "R4", "X4", "R5", "X5", "Est"];

const MARGIN = {
    top: 50,
    right: 20,
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
            new CandidateLabel(),
            new CandidateRounds()
        ];
    }

    render(dataSelection: DaysDataSource, t: TransitionCoordinator) {
        let daysData = dataSelection.daysData;
        let fasterCount = daysData.filter(d => d._positionWithinSelectionRange == PositionWithinSelectionRange.FASTER).length,
            slowerCount = daysData.filter(d => d._positionWithinSelectionRange == PositionWithinSelectionRange.SLOWER).length;

        // dataSelection = daysData
        //     .filter(d =>
        //         (!d._showOnlyMatchingCategory || d._selectedCandidate || d._selectedBenchmark) &&
        //         d._positionWithinSelectionRange === PositionWithinSelectionRange.WITHIN &&
        //         d._selectedLanguage)
        //     .sort((a, b) => {
        //         let compareTotal = a.Total - b.Total,
        //             compareFirstRound = a["R1"] - b["R1"];
        //         return a.Total != b.Total ? compareTotal : compareFirstRound;
        //     });

        // Update container height
        let height = ROW_HEIGHT * (daysData.length + 2); // Data rows + 2 info rows.
        this.svg.transition(t).attr("height", height + MARGIN.top + MARGIN.bottom);

        //~~~~~ Bind axes

        let x = d3.scaleLinear().range([0, this.width]);
        let maxValue = d3.max(daysData, d => d["Total"]) as number;
        x.domain([0, maxValue] as Array<number>).nice();

        let y = d3.scaleBand().rangeRound([0, height]).padding(0.1).paddingOuter(1);
        y.domain(daysData.map(d => d["Participant"]));

        //~~~~ Create nodes for new candidates

        let candidate = this.canvas.selectAll("g.candidate")
            .data(daysData, d => d["Participant"] as string);


        let candidateEnter = candidate.enter()
            .append("g").attr("class", "candidate")
            .attr("transform",
                (d, i) => "translate(0," + (y(d["Participant"]) + height * this.getTransitionDirection(d._previousPositionWithinSelectionRange)) + ")")
            .call((s) => this.candidateComponents.forEach(comp => comp.create(s, x, y)));

        let candidateUpdate = candidate.merge(candidateEnter);
        candidateUpdate.transition(t)
            .attr("transform",
                (d, i) => "translate(0," + (d._y0 = y(d["Participant"])) + ")")
            .call((s) => this.candidateComponents.forEach(comp => comp.update(s, x, y)));

        candidate.exit().transition(t)
            .attr("transform", (d: any) => `translate(0, ${d._y0 + height * this.getTransitionDirection(d._positionWithinSelectionRange)})`)
            .call((s) => this.candidateComponents.forEach(comp => comp.remove(s, x, y)))
            .remove();

        //~~~~ Update the axis

        let axisQuadrants = 8;
        let minTimeIncrement = 30;
        let tickStep = Math.round(maxValue / (axisQuadrants * minTimeIncrement)) * minTimeIncrement;
        let tickValues = d3.range(0, maxValue, tickStep);

        this.gTopAxis.transition(t)
            .call(d3.axisTop(x)
                .tickFormat((numberLike, index) => formatMinutes(numberLike.valueOf()))
                .tickValues(tickValues)
                .tickSize(-height) as any);

        if (fasterCount > 0) {
            this.gTopAxisInfoText
                .style("display", "initial")
                .text("Faster candidates hidden by filter: " + fasterCount);

            this.gTopAxisInfoRect.transition(t)
                .style('display', 'initial')
                .attr('width', 240)
                .attr('height', 16);
        } else {
            this.gTopAxisInfoText.style("display", "none");
            this.gTopAxisInfoRect.style('display', 'none');
        }
        
        this.gBottomAxis.transition(t)
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat((numberLike, index) => formatMinutes(numberLike.valueOf()))
                .tickValues(tickValues)
                .tickSize(0));

        if (slowerCount > 0) {
            this.gBottomAxisInfoText.transition(t)
                .attr("transform", `translate(5, ${height - 5})`)
                .style("display", "initial")
                .text("Slower candidates hidden by filter: " + slowerCount);
            
            this.gBottomAxisInfoRect.transition(t)
                .attr('transform', `translate(3, ${height - 20})`)
                .style('display', 'initial')
                .attr('width', 250)
                .attr('height', 17);
        } else {
            this.gBottomAxisInfoText.style("display", "none");
            this.gBottomAxisInfoRect.style('display', 'none');
        }
    }

    private getTransitionDirection(p: PositionWithinSelectionRange): number {
        return p == PositionWithinSelectionRange.FASTER ? -1 : 1;
    }
}

interface ChartComponent {
    create(selection: AppendableSelection, x: XScale, y: YScale)

    update(selection: UpdatableSelection, x: XScale, y: YScale)

    remove(selection: UpdatableSelection, x: XScale, y: YScale)
}

class CandidateLabel implements ChartComponent {

    create(selection: AppendableSelection, x: XScale, y: YScale) {
        selection.append("text").attr("class", "label candidate")
            .style("opacity", 1)
            .attr("x", -180)
            .attr("y", y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(d => d.Participant);

        selection.append("text").attr("class", "label benchmark")
            .style("opacity", 1)
            .attr("x", -110)
            .attr("y", y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr('fill', '#82929f')
            .text(d => `| ${d.Group}`);

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

class CandidateRounds implements ChartComponent {

    create(selection: AppendableSelection, x: XScale, y: YScale) {
        let rounds = selection.selectAll("rect.roundTime")
            .data(function (d) {
                let rounds = [];
                let offset = 0;
                for (let dataColumn of dataColumns) {
                    let value = d[dataColumn];
                    rounds.push({"id": dataColumn, "offset": offset, "value": value});
                    offset += value;
                }
                return rounds;
            }, (r) => r["id"]);

        rounds.enter()
            .insert("rect", "rect.categoryOverlay").attr("class", "roundTime")
            .style("opacity", 0)
            .style("fill", r => ColourCode.forRound(r["id"]))
            .attr("x", r => x(r["offset"]))
            .attr("width", r => x(r["value"]))
            .attr("height", y.bandwidth());
    }

    update(selection: UpdatableSelection, x: XScale, y: YScale) {
        selection.selectAll("rect.roundTime")
            .style("opacity", 1)
            .attr("x", r => x(r["offset"]))
            .attr("width", r => x(r["value"]))
            .attr("height", y.bandwidth());
    }

    remove(selection: UpdatableSelection, x: XScale, y: YScale) {
        selection.selectAll("rect.roundTime")
            .style("opacity", 0)
    }
}



