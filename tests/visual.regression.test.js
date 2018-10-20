const connect = require('connect');
const serveStatic = require('serve-static');
const fs = require('fs');
const puppeteer = require('puppeteer');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

let app;
let page;
let browser;

const port = 8082;
const reportUrl = `http://localhost:${port}/index.html?candidate=mmxl01&benchmark=Mscape`;
const screenshotsPath = './tests/screenshots';
let testsOutputPath;

const width = 1200;
const height = 1800;

beforeAll(async () => {
    if (!fs.existsSync('tests_output')){
        fs.mkdirSync('tests_output');
    }

    testsOutputPath = `tests_output/test_run_${new Date().toISOString().replace(/:/g, '-')}`;
    fs.mkdirSync(testsOutputPath);

    testsOutputPath = `./${testsOutputPath}`;

    app = connect().use(serveStatic('./dist')).listen(port);
    
    browser = await puppeteer.launch({
        args: [`--window-size=${width},${height}`, '--no-sandbox']
    });

    page = await browser.newPage();
    await page.setViewport({ width, height });
});

afterAll(() => {
    browser.close();
    app.close();
});

const getFilesDiffPixelsCount = function(baselinePath, renderedPath, diffPath) {
    return new Promise(resolve => {
        var rendered = fs.createReadStream(renderedPath).pipe(new PNG()).on('parsed', doneReading),
            baseline = fs.createReadStream(baselinePath).pipe(new PNG()).on('parsed', doneReading),
            filesRead = 0;

        function doneReading() {		
            if (++filesRead < 2) {		
                return;		
            }

            var diff = new PNG({width: rendered.width, height: rendered.height});		
            var diffPixeslsCount = pixelmatch(rendered.data, baseline.data, diff.data, rendered.width, rendered.height, {threshold: 0});
            if (diffPixeslsCount > 0) {		
                diff.pack().pipe(fs.createWriteStream(diffPath));		
            }

            resolve(diffPixeslsCount);
        }
    });
};

describe('Visual regression tests', () => {
    test('Rendered default page should be equal to baseline default page screenshot', async () => {
        let baselinePath = `${screenshotsPath}/visual.regression.default.png`;
        let renderedPath = `${testsOutputPath}/visual.regression.default.rendered.png`;
        let diffPath = `${testsOutputPath}/visual.regression.default.diff.png`;

        await page.goto(reportUrl);
        await page.waitFor(500);
        await page.screenshot({path: renderedPath});

        let result = await getFilesDiffPixelsCount(baselinePath, renderedPath, diffPath);
        expect(result).toBe(0);
    }, 30000);

    test('Rendered page with toggled controls should be equal to baseline toggled page screenshot', async () => {
        let baselinePath = `${screenshotsPath}/visual.regression.toggled.png`;
        let renderedPath = `${testsOutputPath}/visual.regression.toggled.rendered.png`;
        let diffPath = `${testsOutputPath}/visual.regression.toggled.diff.png`;

        await page.goto(reportUrl);
        await page.waitFor(500);
        await page.evaluate(() => {
            const dispatchChangedEvent = function(element) {
                let event = new Event('change', { bubbles: true });
                event.simulated = true;
                element.dispatchEvent(event);
            }

            let candidateSelection = document.getElementById('control-candidate-selection');
                benchmarkSelection = document.getElementById('control-benchmark-selection');
                showOnlyMatching = document.getElementById('control-show-only-matching');
                showRoundTimes = document.getElementById('control-show-round-times');
                timeRangeFilter = document.getElementById('control-time-range-filter')
                languageSelection = document.getElementById('control-language-selection');
                        
            candidateSelection.querySelector('option:nth-child(1)').selected = true;
            dispatchChangedEvent(candidateSelection);

            benchmarkSelection.querySelector('option:nth-child(1)').selected = true;
            dispatchChangedEvent(benchmarkSelection);
            
            showOnlyMatching.checked = true;
            dispatchChangedEvent(showOnlyMatching);
            
            showRoundTimes.checked = true;
            dispatchChangedEvent(showRoundTimes);

            languageSelection.querySelector('option:nth-child(3)').selected = true;
            dispatchChangedEvent(languageSelection);

            timeRangeFilter.noUiSlider.set([60 * 3, 60 * 4]);
        });
        
        await page.waitFor(1000);
        await page.screenshot({path: renderedPath});

        let result = await getFilesDiffPixelsCount(baselinePath, renderedPath, diffPath);
        expect(result).toBe(0);
    }, 30000);
});
