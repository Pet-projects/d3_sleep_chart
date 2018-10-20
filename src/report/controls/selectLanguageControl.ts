import { Control } from './control';
import { ControlsListener } from './controlsListener';
import { AppendableSelection, DataArray, DataRow } from '../domain';

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

    updateVisualsWithNewData(data: DataArray) {
        let languages = [];
        
        data.forEach(item => {
            if (languages.indexOf(item.Language) < 0) {
                languages.push(item.Language);
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

    enrichData(item: DataRow) {
        let selectedLanguage = this.languageSelect.property('value');

        item._selectedLanguage =
            selectedLanguage === this.allOption ||
            selectedLanguage === item.Language;
    }
}
