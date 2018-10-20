import {Control} from "./control";
import {ControlsListener} from "./controlsListener";
import {AppendableSelection, DataArray, DataRow} from "../domain"

const DEFAULT_SHOW_ONLY_MATCHING = false;

/**
 * Toggles the filtering of the data based on the categories selected
 */
export class ShowOnlyMatchingControl implements Control {
    showOnlyMatching: boolean;
    onlyMatchingToggle: AppendableSelection;

    constructor(showOnlyMatchingInput: AppendableSelection) {
        this.onlyMatchingToggle = showOnlyMatchingInput;
        this.showOnlyMatching = DEFAULT_SHOW_ONLY_MATCHING;

        this.onlyMatchingToggle.property('checked', this.showOnlyMatching);
    }

    registerListener(controlsListener: ControlsListener) {
        this.onlyMatchingToggle.on("change", () => {
            this.showOnlyMatching = this.onlyMatchingToggle.property("checked");
            console.log("[Controls] showOnlyMatching: " + this.showOnlyMatching);
            controlsListener.controlsChanged();
        });
    }

    updateVisualsWithNewData(data: DataArray) {
        //No need to update this data
    }

    enrichData(d: DataRow) {
        d._showOnlyMatchingCategory = this.showOnlyMatching;
   }
}
