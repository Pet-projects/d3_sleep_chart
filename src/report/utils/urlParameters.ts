
export class UrlParameters {
    private static candidate;
    private static benchmark;
    private static rangeFrom = 0;
    private static rangeTo = 300;

    static initialize() {
        // Parse url query string.
        window.location.search.substr(1).split('&').forEach(q => {
            let parameter = q.split('=', 2);
            if (parameter.length == 2) {
                let value = decodeURIComponent(parameter[1].replace(/\+/g, ' '));
                this[parameter[0]] = value;
            }
        });
    }

    static getCandidate(): string {
        return this.candidate;
    }

    static setCandidate(value: string) {
        this.candidate = value;
        this.updateUrl();
    }

    static getBenchmark(): string {
        return this.benchmark;
    }

    static setBenchmark(value: string) {
        this.benchmark = value;
        this.updateUrl();
    }

    static getRangeFrom(): number {
        return +this.rangeFrom;
    }

    static setRangeFrom(value: number) {
        this.rangeFrom = value;
        this.updateUrl();
    }

    static getRangeTo(): number {
        return +this.rangeTo;
    }

    static setRangeTo(value: number) {
        this.rangeTo = value;
        this.updateUrl();
    }

    private static updateUrl() {
        let basePath = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        let candidateName =  this.candidate? `candidate=${this.candidate}` : "";
        let benchmarkName = this.benchmark? `benchmark=${this.benchmark}` : "";
        let rangeFrom = `rangeFrom=${this.rangeFrom}`;
        let rangeTo = `rangeTo=${this.rangeTo}`;


        var newurl = basePath + "?" + candidateName + "&" + benchmarkName + "&" + rangeFrom + "&" + rangeTo;
        window.history.replaceState({path: newurl}, '', newurl);
    }
}
