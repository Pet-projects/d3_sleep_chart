import * as d3 from "d3";
import {VisualComponent} from './components/visualComponent';
import {DataArray} from "./domain";
import {Control} from "./controls/control"
import {ControlsListener} from "./controls/controlsListener"
import {ShowOnlyMatchingControl} from "./controls/showOnlyMatchingControl"
import {SelectTimeRangeControl} from "./controls/selectTimeRangeControl"
import {UrlParameters} from './utils/urlParameters'
import {SelectLanguageControl} from "./controls/selectLanguageControl";
import {SleepChart} from "./components/sleepChart";

declare var $; // jQuery.

//Debt the data columns are duplicated. There should be one module describing the domain
let dataColumns = ["R1", "X1", "R2", "X2", "R3", "X3", "R4", "X4", "R5", "X5", "Est"];
let testCoverageColumns = ["C1", "C2", "C3", "C4", "C5"];

// noinspection JSUnusedGlobalSymbols
export function show(dataUrl: string) {
    UrlParameters.initialize();

    let sceneDirector: SceneDirector = new SceneDirector();

    sceneDirector.addVisualComponent(new SleepChart(
        d3.select("#sleepchart")));

    sceneDirector.addControl(new ShowOnlyMatchingControl(
        d3.select("#control-show-only-matching")));
    sceneDirector.addControl(new SelectTimeRangeControl(
        d3.select("#control-time-range-filter")));
    sceneDirector.addControl(new SelectLanguageControl(
        d3.select('#control-language-selection')));

    //DEBT Can this be done without jQuery?
    $('.ui.dropdown').dropdown();

    function computeAggregateData(d: d3.DSVRowAny): d3.DSVRowAny {
        // Convert fields to nums
        d["TClockTime"] = +d["TClockTime"];
        d["TPenalties"] = +d["TPenalties"];
        d["Total"] = +d["Total"];

        // Convert times columns
        for (let dataColumn of dataColumns) {
            d[dataColumn] = +d[dataColumn];
        }

        // Convert coverage and keep the last value
        d.overallTestCoverage = null;
        for (let testCoverageColumn of testCoverageColumns) {
            if (d[testCoverageColumn].trim().length > 0) {
                d[testCoverageColumn] = +d[testCoverageColumn];
                d.overallTestCoverage = d[testCoverageColumn];
            } else {
                d[testCoverageColumn] = NaN
            }
        }

        return d;

    }

    d3.csv(dataUrl, computeAggregateData,
        function (error, inboundData: d3.DSVParsedArray<any>) {
            if (error) throw error;
            if (!inboundData) {
                window.alert("Failed to load candidate data.");
            }

            sceneDirector.dataSourceChanged(inboundData);
        });
}

// ~~~~~~~~~~~~~~~~~ Main Components ~~~~~~~~~~~~~~~~~~~~

/**
 * Manages the flow of the system.
 *
 * A. On data load from external source (CSV):
 *  - the controls are notified to update their views based on the new data
 *  - the controls will be initialised with default values
 *  - the scene is rendered immediately
 *
 * B. On user control engaged (buttons, toggles):
 *  - the data stream is passed to each individual control for filtering
 *  - the final data selection is sent to the charts
 *  - the scene is rendered with a smooth transition
 */
class SceneDirector implements ControlsListener {
    hasRenderedData: any;
    isSlowMotion: boolean;
    data: DataArray;
    visualComponents: VisualComponent[];
    controls: Control[];

    constructor() {
        this.visualComponents = [];
        this.data = [];
        this.controls = [];


        // Holding the altKey will trigger slowMotion
        this.isSlowMotion = false;
        d3.select(window)
            .on("keydown", () => {
                this.isSlowMotion = d3.event.altKey;
            })
            .on("keyup", () => {
                this.isSlowMotion = false;
            });
    }

    addVisualComponent(visualComponent: VisualComponent) {
        this.visualComponents.push(visualComponent);
    }


    addControl(control: Control) {
        this.controls.push(control);
        control.registerListener(this);
    }

    dataSourceChanged(inboundData: d3.DSVParsedArray<any>) {
        console.log("Data source changed");
        this.data = inboundData;
        this.controls.forEach(control => control.updateVisualsWithNewData(this.data));
        this.renderScene();
    }

    controlsChanged() {
        console.log("Controls have been changed");
        this.renderScene();
    }

    renderScene() {
        console.log("Trigger render scene");
        let transitionDuration = 0;
        if (this.hasRenderedData) {
            transitionDuration = this.isSlowMotion ? 7500 : 750;
        } else {
            this.hasRenderedData = this.data.length > 0;
        }
        console.log("Transition duration set to: " + transitionDuration);

        let enrichedData = this.enrichData(),
            transition = d3.transition("all").duration(transitionDuration);

        this.visualComponents.forEach(c => c.render(enrichedData, transition));

        var candidateData = enrichedData.filter(d => d._selectedCandidate)[0];
        d3.select('#report-for-candidate').text(candidateData.Participant);
        document.title = `Report for ${candidateData.Participant}`;
    }

    private enrichData() {
        this.data.forEach(d => this.controls.forEach(control => control.enrichData(d)));
        return this.data;
    }
}
