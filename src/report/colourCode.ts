

export class ColourCode {


    //~~~~~~~~ Feedback ~~~~~~~~~~

    static positive() :string {
        return "#3c763d";
    }

    static negative() :string {
        return "#a94442";
    }

    static neutral() :string {
        return "#31708f";
    }

    //~~~~~~~~ Categories ~~~~~~

    static candidate() :string {
        return "#ff892d";
    }

    static benchmark() :string {
        return "#6b6ecf";
    }

    static others() :string {
        return "#4e4e4c";
    }


    //~~~~~~~~ Rounds ~~~~~~~~~~

    static roundColours = {
        "R1": "#10654a",
        "R2": "#1d9e6c",
        "R3": "#33df53",
        "R4": "#3dffec",
        "R5": "#1e9eff",
        "Est": "#858582",
    };
    static penaltyColour = "#fe8a8e";


    static roundTextColour = {
        "R1": "#ffffff",
        "R2": "#ffffff",
        "R3": "#000000",
        "R4": "#000000",
        "R5": "#ffffff",
        "Est": "#ffffff",
    };
    static textPenaltyColour = "#ffffff";

    static forRound(id: string) :string {
        return id.indexOf("X", 0) === 0 ? ColourCode.penaltyColour : ColourCode.roundColours[id];
    }

    static textForRound(id: string) :string {
        return id.indexOf("X", 0) === 0 ? ColourCode.textPenaltyColour : ColourCode.roundTextColour[id];
    }
}