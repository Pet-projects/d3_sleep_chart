import {ControlsListener} from "./controlsListener";
import {DataArray, DataRow, DaysDataSource, DayDataRow} from "../domain"

export interface Control {
    registerListener(controlsListener: ControlsListener)

    updateVisualsWithNewData(data: DaysDataSource)

    enrichData(data: DayDataRow)
}
