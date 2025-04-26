import {CustomForm} from 'sabre-ngv-custom-forms/interfaces/form/CustomForm';
import {ICustomFormsService} from 'sabre-ngv-custom-forms/services/ICustomFormsService';
import {getService} from '../Context';

export const openCustomFormParagraph = (title: string, msg: string): void => {
    const form: CustomForm = {
        title,
        fields: [
            {
                id: 'flight',
                type: 'PARAGRAPH',
                text: msg
            }
        ],
        actions: [
            {
                id: 'cancel',
                label: 'Close'
            }
        ]
    };
    getService(ICustomFormsService).openForm(form);
}