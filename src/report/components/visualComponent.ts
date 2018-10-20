import {
    DataArray,
    TransitionCoordinator
} from "../domain";

export interface VisualComponent {
    render(dataSelection: DataArray, t: TransitionCoordinator);
}
