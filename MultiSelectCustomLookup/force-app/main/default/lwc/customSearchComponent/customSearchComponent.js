import { LightningElement,api} from 'lwc';

export default class CustomSearchComponent extends LightningElement {  
   
    // public variables

        // placeholder for input field
        @api placeholder = "Search text here";

        // label for input field
        @api label = "Search Records";

        // boolean indicating whether it is required
        @api required = false;

        // help text for field
        @api helpText;

        // the input value the user typed
        @api searchKey;

    // public methods

        @api checkValidity() {
            return this.template.querySelector('lightning-input').checkValidity();
        }

        @api reportValidity() {
            return this.template.querySelector('lightning-input').reportValidity();
        }

    // private variables/getters/handlers

        // whenever the user types new input, bubble up an event to parent components
        handleChange(event){

            const methodName = 'handleChange';
            
            try {

                // the user input value
                const searchKey = event.target.value;
                
                /* eslint-disable no-console */
                // console.log(componentName+'.'+methodName+': searchKey event sent: ' + searchKey);
    
                // prevent any default behaviour by the event
                event.preventDefault();
                
                // fire a search event that the parent component can capture
                this.dispatchEvent(new CustomEvent(
                    'search',
                    {
                        detail : searchKey
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