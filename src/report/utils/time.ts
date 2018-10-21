

export function formatMinutes(d: number): string {
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