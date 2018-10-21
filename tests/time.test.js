
exports.__esModule = true;
const dateTimeToEpoch = require("../src/report/utils/time").dateTimeToEpoch;


describe('Time utils', function () {

    it('can convert date to epoch', function () {
        expect(dateTimeToEpoch("6-Aug-2018", "00:00"))
            .toBe(new Date(2018, 7, 6, 0, 0, 0).getTime());
    });
});
