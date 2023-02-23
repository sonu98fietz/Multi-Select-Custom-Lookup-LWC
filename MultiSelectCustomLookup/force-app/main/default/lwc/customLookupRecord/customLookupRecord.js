import { LightningElement, api } from 'lwc';
// import utility methods
import { isEmpty, errorMessage, toastError } from 'c/lwcUtils';
export default class CustomLookupRecord extends LightningElement {
    // the record to display, must have the .Name property set
    @api record;

    // the icon to display
    @api iconName;

    // show larger icon when there is a 2nd line (Description)
    get iconSize() {
        if (!isEmpty(this.record.Description)) {
            return 'medium';
        } else {
            return 'small';
        }
    }

    // get style for displaying the name, padding based on whether there is an icon to display
    get recordStyle() {
        var style;
        if (!isEmpty(this.iconName)) {

            // set the padding based on the icon size
            if (!isEmpty(this.record.Description)) {
                style = 'padding-top: 2px;';
            } else {
                style = 'padding-top: 6px;';
            }
        }
        return style;
    }

    handleSelect(event){

        const methodName = 'handleChange';

        try {

            event.preventDefault();
    
            // console.log(componentName+'.'+methodName+': sending select event, record.Id: ' + this.record.Id);
    
            // make a copy of record so it can be passed by value
            const recordCopy = Object.assign({}, this.record);
    
            // console.log(componentName+'.'+methodName+': dispatching \'select\' event with detail: recordCopy: ' + JSON.stringify(recordCopy));
    
            // fire the event to be handled on the parent component
            this.dispatchEvent(new CustomEvent(
                'select',
                {
                    detail : recordCopy
                }
            ));

        } catch (err) {
            this.handleError(errorMessage(err));
        }
    }

    // helper methods

        // if a process encounters an error, display that error to the user
        handleError(error) {

            const methodName = 'handleError';

            // console.log(componentName+'.'+methodName+': event received');
            // console.log(componentName+'.'+methodName+': error: ', JSON.stringify(error));

            // uncomment this line if this component has a spinner that should be disabled
            // this.showSpinner = false;

            try {
                toastError(this, 'Error', error);
            } catch (err) {
                // console.log(componentName+'.'+methodName+': Could not display this error message to the user: ' + error);
            }

        }
}