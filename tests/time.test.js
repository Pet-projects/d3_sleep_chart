
exports.__esModule = true;
const dateTimeToEpoch = require("../src/report/utils/time").dateTimeToEpoch;
const formatMinutesAsPrettyString = require("../src/report/utils/time").formatMinutesAsPrettyString;
const timestampToHourAndMinutes = require("../src/report/utils/time").timestampToHourAndMinutes;


describe('Time utils', function () {

    it('dateTimeToEpoch can convert date to epoch', function () {
        expect(dateTimeToEpoch("6-Aug-2018", "00:00"))
            .toBe(new Date(2018, 7, 6, 0, 0, 0).getTime());
    });


    it('formatMinutesAsPrettyString can format minutes into pretty strings', function () {
        expect(formatMinutesAsPrettyString(0)).toBe("0");
        expect(formatMinutesAsPrettyString(1)).toBe("1m");
        expect(formatMinutesAsPrettyString(60)).toBe("1h ");
        expect(formatMinutesAsPrettyString(61)).toBe("1h 1m");
        expect(formatMinutesAsPrettyString(70)).toBe("1h 10m");
    });

    it('timestampToHourAndMinutes can hour', function () {
        expect(timestampToHourAndMinutes(dateTimeToEpoch("1-Aug-2018", "00:00"))).toBe("00:00");
        expect(timestampToHourAndMinutes(dateTimeToEpoch("2-Aug-2018", "02:00"))).toBe("02:00");
        expect(timestampToHourAndMinutes(dateTimeToEpoch("2-Aug-2018", "23:59"))).toBe("23:59");
    });
});
