import {
    DaysDataSource,
    TransitionCoordinator
} from "../domain";

export interface VisualComponent {
    render(dataSelection: DaysDataSource, t: TransitionCoordinator);
}
