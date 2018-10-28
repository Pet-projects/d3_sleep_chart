import {ActivityType} from "./domain";


export class ColourCode {

    static forActivity(activityType: ActivityType) :string {
        switch (activityType) {
            case ActivityType.SLEEP:
                return "#10654a";
            case ActivityType.FEED:
                return "#33df53";
        }
    }
}