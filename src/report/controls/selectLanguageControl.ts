import { Control } from './control';
import { ControlsListener } from './controlsListener';
import {AppendableSelection, DataArray, DataRow, DaysDataSource, DayDataRow} from '../domain';

export class SelectLanguageControl implements Control {
    private languageSelect: AppendableSelection;

    private readonly allOption: string = 'All';

    constructor(languageSelect: AppendableSelection) {
        this.languageSelect = languageSelect;
    }

    registerListener(controlsListener: ControlsListener) {
        this.languageSelect.on('change', () => {
            controlsListener.controlsChanged();
        });
    }

    updateVisualsWithNewData(data: DaysDataSource) {
        let languages = [];
        
        data.daysData.forEach(item => {
            if (languages.indexOf(item.dayStartEpoch) < 0) {
                languages.push(item.dayEndEpoch);
            }
        });
        
        languages = languages.sort((a, b) => a > b ? 1 : -1);
        languages = [this.allOption].concat(languages);

        this.languageSelect
            .selectAll()
            .data(languages)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
    }

    enrichData(item: DayDataRow) {
        // let selectedLanguage = this.languageSelect.property('value');
        //
        // item._selectedLanguage =
        //     selectedLanguage === this.allOption ||
        //     selectedLanguage === item.Language;
    }
}
