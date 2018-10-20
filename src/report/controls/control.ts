import {ControlsListener} from "./controlsListener";
import {DataArray, DataRow} from "../domain"

export interface Control {
    registerListener(controlsListener: ControlsListener)

    updateVisualsWithNewData(data: DataArray)

    enrichData(data: DataRow)
}
