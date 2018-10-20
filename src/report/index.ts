import {show} from './sleepReport';

declare var globalConfig;

let dataUrl = globalConfig.dataUrl;
if (dataUrl.startsWith("./")) {
    dataUrl = new URL(dataUrl, window.location.href).href
}

show(dataUrl);
