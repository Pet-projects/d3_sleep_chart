

export function formatMinutesAsPrettyString(d: number): string {
    if (d === 0)
        return '0';

    let hours = Math.floor(d / 60),
        minutes = Math.floor(d - (hours * 60));
    let output = '';
    if (minutes) {
        output = minutes + 'm' + output;
    }
    if (hours) {
        output = hours + 'h ' + output;
    }
    return output;
}

export function dateTimeToEpoch(date: string, hour: string): number {
    return Date.parse(date + ", " + hour);
}

const MONTH_NAMES = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sept", "Oct",
    "Nov", "Dec"
];

function pad(num) {
    return ("0"+num).slice(-2);
}

export function epochToDateTime(timestamp: number): string {
    let d = new Date(timestamp);
    return d.getDate() + "-" + MONTH_NAMES[d.getMonth()] + "-" + d.getFullYear() + "_" +
        pad(d.getHours()) + ":" + pad(d.getMinutes());
}

export function timestampToHourAndMinutes(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return pad(hours)+":"+pad(minutes)
}
