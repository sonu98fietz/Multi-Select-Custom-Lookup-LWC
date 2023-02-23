import { LightningElement, api, wire } from 'lwc';

/* eslint-disable no-console */
/* eslint-disable vars-on-top */

// for debugging
const componentName = 'CustomLookup';

// method for searching for a list of records by a search key
import findRecords from '@salesforce/apex/CustomLookup.findRecords';
import getRecord from '@salesforce/apex/CustomLookup.getRecord';

// method for getting the UI theme (classic/lightning/mobile)
import getUITheme from '@salesforce/apex/CustomLookup.getUITheme';

// utility methods
import { errorMessage, isEmpty, toastError, getFieldFromSObject, randomNumber } from 'c/lwcUtils';
export default class CustomLookup extends LightningElement {
        // constructors/lifecycle callbacks

        // for methods that need to run after public variables have been instantiated
        connectedCallback() {

            const methodName = 'connectedCallback';

            // console.log(componentName+'.'+methodName+': start');

            // if the record id has been provided when the component was instantiated
            if (!isEmpty(this.recordId) && isEmpty(this.selectedRecord)) {
                // console.log(componentName+'.'+methodName+': recordId: ' + this.recordId + ' has been specified, looking up record');

                // force the record to be queried
                this.setValue(this.recordId);
            }

            // console.log(componentName+'.'+methodName+': end');
        }

    // public variables

        // label for the search box
        @api label = "Search text here";

        // placeholder text for the search box
        @api placeholder = "Search Records";

        // icon to display for the records list
        @api iconName;
        
        // search type
        // SOQL | SOSL
        @api searchType = 'SOSL';

        // object to search against
        @api objectName;

        // comma separated list of fields to search against
        @api searchFields;

        // comma separated list of fields to display
        @api displayFields;
        
        // comma separated list of any additional fields to query and return in the results
        @api additionalFields;

        // any additional criteria to apply to the search
        @api additionalCriteria;

        // any order by fields to apply to the search in the format: FieldName1 ASC|DESC, FieldName2 ASC|DESC, etc.
        @api orderBy;

        // true if you want to strip any fields that are inaccessible to the running user
        @api stripInaccessible = false;

        // true if you want to show an error if querying any fields that are inaccessible to the running user
        @api securityEnforced = false;

        // boolean indicating whether field is required
        @api required = false;

        // help text for the input field
        @api helpText;

        // style to apply to the selected record
        @api selectedStyle = "background-color: rgb(236 236 236)";

        // the minimum number of characters to perform a search
        @api minSearchCharacters = 2;

        // override scollable result css
        @api customResultDivCss;

    // public methods

        @api recordId;

        // method to set the value that is selected
        @api setValue(recordId) {

            const methodName = 'setValue';
            
            // console.log(componentName+'.'+methodName+': start');

            try {

                // console.log(componentName+'.'+methodName+': recordId: ' + recordId);

                // look up the default selected record
                if (!isEmpty(recordId)) {

                    // turn on the loading spinner
                    this.showLoadingSpinner = true;

                    // add display field to the additional fields to query
                    let additionalFields = this.additionalFields;

                    // Call the apex method to get the matching records
                    getRecord({
                        recordId : recordId, 
                        objectName : this.objectName, 
                        displayFields : this.displayFields,
                        additionalFields : additionalFields,
                        securityEnforced: this.securityEnforced,
                        stripInaccessible: this.stripInaccessible
                    })
                    .then(result => {

                        const methodName = 'getRecord';

                        // console.log(componentName+'.'+methodName+': apex result: ', result);

                        // initialize result
                        this.selectedRecord = undefined;

                        if (!isEmpty(result)) {

                            // set the record to return by cloning the result
                            let rec = Object.assign({}, result);

                            // build the output for display
                            let displayFieldsList = this.displayFields?.split(/, ?/);
                            // console.log(componentName+'.'+methodName+': displayFieldsList: ' + displayFieldsList);

                            let nameOutput = '';
                            let descriptionOutput = '';
                            if (!isEmpty(displayFieldsList)) {
                                for (let j = 0; j < displayFieldsList.length; j++) {

                                    let displayField = displayFieldsList[j];
                                    // console.log(componentName+'.'+methodName+': displayField: ' + displayField);

                                    // if the field is wrapped in toLabel(), remove that to get the field name
                                    if (displayField.includes('toLabel(')) {
                                        displayField = displayField.replace('toLabel(', '');
                                        displayField = displayField.substring(0, displayField.length - 1);
                                    }
                                    // console.log(componentName+'.'+methodName+': displayField (after): ' + displayField);
                                    
                                    let value = result[displayField];
                                    // console.log(componentName+'.'+methodName+': value: ' + value);

                                    // first value becomes the name
                                    if (j === 0) {
                                        nameOutput = value;

                                    // all the other display values go on the next line under the Description property
                                    } else {
                                    
                                        if (descriptionOutput.length > 0) {
                                            descriptionOutput += ' | ';
                                        }

                                        descriptionOutput += value;
                                    }
                                }
                            }

                            // console.log(componentName+'.'+methodName+': nameOutput: ' + nameOutput);
                            // console.log(componentName+'.'+methodName+': descriptionOutput: ' + descriptionOutput);
                            
                            // if nothing to display, show the Id
                            if (isEmpty(nameOutput)) {
                                // console.log(componentName+'.'+methodName+': no display output is set, using Id');
                                nameOutput = rec.Id;
                            }

                            // set the Name field to the display output
                            rec.Name = nameOutput;
                            rec.Description = descriptionOutput;

                            // console.log(componentName+'.'+methodName+': rec: ', rec);

                            this.selectedRecord = rec;
                            // console.log(componentName+'.'+methodName+': this.selectedRecord: ', JSON.stringify(this.selectedRecord));

                            // send the value to the parent component
                            // commented this out because if the parent is using setValue() then it shouldn't need this event
                            // because it can make the parent think that a change occurred and the parent might react to that in a way that isn't expected
                            // consider removing this completely
                            // this.dispatchEvent(new CustomEvent(
                            //     'select',
                            //     {
                            //         detail : this.selectedRecord
                            //     }
                            // ));

                        }

                        // turn off loading spinner
                        this.showLoadingSpinner = false;

                    })
                    .catch(err => {
                        this.records = undefined;
                        this.handleError('An error occurred while setting value. ' + errorMessage(err));
                    });

                } else{
                    this.selectedRecord = null;
                    this.showLoadingSpinner = false;
                }

            } catch (err) {
                this.handleError(errorMessage(err));
            }
            
        }

        // return the selected value
        @api get() {
            return this.selectedRecord;
        }

        // method to clear the value that is selected
        @api clear() {
            this.handleRemove();
        }

        // if the search component is being displayed, return its validity
        // otherwise assume valid=true because a selection has been made
        @api checkValidity() {

            const methodName = 'checkValidity';
            
            try {
                let element = this.template.querySelector('c-tms-custom-search-component');
                if (!isEmpty(element)) {
                    return element.checkValidity();
                } else {
                    return true;
                }
            } catch (err) {
                this.handleError(errorMessage(err));
                return false;
            }
        }

        // if the search component is being displayed, return its validity and display the result to the user
        // otherwise assume valid=true because a selection has been made
        @api reportValidity() {

            const methodName = 'reportValidity';
            
            try {
                let element = this.template.querySelector('c-search-component');
                if (!isEmpty(element)) {
                    return element.reportValidity();
                } else {
                    return true;
                }
            } catch (err) {
                this.handleError(errorMessage(err));
                return false;
            }
        }

    // private variables/getters/handlers

        // spinner to display while searching
        showSpinner = false;

        // spinner to display while loading record
        showLoadingSpinner = false;

        // return true if the minimum parameters have been specified
        get componentReady() {
            return !isEmpty(this.objectName) && !isEmpty(this.displayFields) && (this.searchType === 'SOSL' || !isEmpty(this.searchFields));
        }

        // disable suggestion scrolling on mobile
        get scollableClass() {
            let scrollableClass = 'search-results';
            
            // if mobile, don't scroll
            if (this.uiTheme === 'Theme4t') {
                scrollableClass += ' slds-scrollable_none slds-m-top_xxx-small';
            
            // otherwise scroll
            } else {
                scrollableClass += ' slds-scrollable_y slds-m-top_xxx-small';
            }

            return scrollableClass;
        }

        // disable suggestion scrolling on mobile
        get scrollableStyle() {
            let scrollableStyle;
            
            // if mobile, don't scroll
            if (this.uiTheme === 'Theme4t') {
                scrollableStyle = 'width:100%';
            
            // otherwise scroll with a maximum height
            } else {
                scrollableStyle = isEmpty(this.customResultDivCss) ? 'max-height:15rem; width:100%' : this.customResultDivCss;
            }

            return scrollableStyle;
        }

        // get the UI Theme
        uiTheme;

            @wire(getUITheme, {}
            ) wiregetUITheme({error, data}) {

                const methodName = 'getUITheme';
            
                // console.log(componentName+'.'+methodName+':wire method called');
            
                if (error) {
            
                    // console.log(componentName+'.'+methodName+': error: ', JSON.stringify(error));
            
                    toastError(this, 'Error', errorMessage(error));
            
                } else if (data !== undefined && data !== null) {
            
                    // console.log(componentName+'.'+methodName+': data: ', JSON.stringify(data));

                    try {
            
                        this.uiTheme = data;

                    } catch (err) {
                        this.handleError(errorMessage(err));
                    }
                    
                }
            }
        
        // list of records found
        records;

        // record that has been selected
        selectedRecord;

        // flag to indicate no records were found
        noResultsFound;

        // the search identifier that identifies a search, to make sure we only display the latest search results
        searchId;

        // when the user inputs text into the search box, this event is fired
        handleChange(event){

            const methodName = 'handleChange';

            //event.preventDefault();

            try {

                // the user input
                const searchString = event.detail;

                // reset the no results found flag
                this.noResultsFound = false;
                
                // console.log(componentName+'.'+methodName+': change event received');

                // console.log(componentName+'.'+methodName+': searchString: ' + searchString);
                // console.log(componentName+'.'+methodName+': minSearchCharacters: ' + this.minSearchCharacters);

                // ignore when value "undefined" is sent
                if (searchString !== undefined) {

                    // force a validity check to remove the requiredness check if no longer empty
                    let element = this.template.querySelector('c-tms-custom-search-component');
                    if (!isEmpty(element)) {
                        element.reportValidity();
                    }

                    // if the user input text and the length is >= minSearchCharacters characters
                    // call the apex method to search for results and update the record list
                    if (!isEmpty(searchString) && searchString.length >= this.minSearchCharacters) {

                        // turn on spinner
                        this.showSpinner = true;

                        // generate a random id to identify this search
                        this.searchId = randomNumber();
                        // console.log(componentName+'.'+methodName+': searchId: ' + JSON.stringify(this.searchId));
                            
                        // Call the apex method to find the matching records
                        findRecords({
                            searchId: this.searchId,
                            searchType: this.searchType,
                            searchString : searchString, 
                            objectName : this.objectName, 
                            searchFields : this.searchFields,
                            displayFields : this.displayFields,
                            additionalFields : this.additionalFields,
                            additionalCriteria: this.additionalCriteria,
                            orderBy: this.orderBy,
                            stripInaccessible: this.stripInaccessible,
                            securityEnforced: this.securityEnforced
                        })
                        .then(searchResultsString => {

                            const methodName = 'findRecords';
                            
                            // console.log(componentName+'.'+methodName+': searchResultsString: ' + searchResultsString);

                            // parse result
                            let searchResults = JSON.parse(searchResultsString);
                            // console.log(componentName+'.'+methodName+': searchResults: ' + JSON.stringify(searchResults));

                            let searchId = searchResults.searchId;
                            let records = searchResults.results;

                            // console.log(componentName+'.'+methodName+': searchId: ' + searchId);
                            // console.log(componentName+'.'+methodName+': records: ' + records.length);

                            // the results being parsed don't match the latest submitted search, so ignore them
                            if (this.searchId !== searchId) {
                                // console.log(componentName+'.'+methodName+': searchId does not match the latest search, ignoring results. Will wait for the latest results to come');

                            } else {
                                // console.log(componentName+'.'+methodName+': searchId matches the latest search, parsing results');

                                // initialize the list of records to display
                                let recordsToDisplay = [];

                                // if at least one record found, add to the list of records
                                if (!isEmpty(records)) {

                                    // console.log(componentName+'.'+methodName+': parsing results');

                                    for(let i=0; i < records.length; i++){

                                        // console.log(componentName+'.'+methodName+': records[i].Id: ' + records[i].Id);
                                        // console.log(componentName+'.'+methodName+': records[i]: ', JSON.stringify(records[i]));
                                        
                                        // the record to add to the list by cloning the records
                                        let rec = Object.assign({}, records[i]);

                                        // build the output for display
                                        let displayFieldsList = this.displayFields?.split(/, ?/);
                                        // console.log(componentName+'.'+methodName+': displayFieldsList: ' + displayFieldsList);

                                        let nameOutput = '';
                                        let descriptionOutput = '';
                                        if (!isEmpty(displayFieldsList)) {
                                            for (let j = 0; j < displayFieldsList.length; j++) {

                                                let displayField = displayFieldsList[j];
                                                // console.log(componentName+'.'+methodName+': displayField: ' + displayField);

                                                // if the field is wrapped in toLabel(), remove that to get the field name
                                                if (displayField.includes('toLabel(')) {
                                                    displayField = displayField.replace('toLabel(', '');
                                                    displayField = displayField.substring(0, displayField.length - 1);
                                                }
                                                // console.log(componentName+'.'+methodName+': displayField (after): ' + displayField);
                                                
                                                // let value = result[i][displayField];
                                                let value = getFieldFromSObject(rec, displayField);
                                                // console.log(componentName+'.'+methodName+': value: ' + value);

                                                // first value becomes the name
                                                if (j === 0) {
                                                    nameOutput = value;

                                                // all the other display values go on the next line under the Description property
                                                } else {

                                                    // if there is a value to output
                                                    if (!isEmpty(value)) {
                                                    
                                                        if (descriptionOutput.length > 0) {
                                                            descriptionOutput += ' | ';
                                                        }

                                                        descriptionOutput += value;

                                                    }
                                                }
                                            }
                                        }

                                        // console.log(componentName+'.'+methodName+': nameOutput: ' + nameOutput);
                                        // console.log(componentName+'.'+methodName+': descriptionOutput: ' + descriptionOutput);
                                        
                                        // if nothing to display, show the Id
                                        if (isEmpty(nameOutput)) {
                                            // console.log(componentName+'.'+methodName+': no display output is set, using Id');
                                            nameOutput = rec.Id;
                                        }

                                        // set the Name field to the display output
                                        rec.Name = nameOutput;
                                        rec.Description = descriptionOutput;

                                        // console.log(componentName+'.'+methodName+': rec: ', JSON.stringify(rec));

                                        // add to list
                                        recordsToDisplay.push(rec);
                                    }
                                
                                // if no results found, set flag
                                } else {
                                    this.noResultsFound = true;
                                }

                                // update the records to display
                                this.records = [...recordsToDisplay];

                                // turn off spinner
                                this.showSpinner = false;

                            }

                        })
                        .catch(err => {
                            this.records = undefined;
                            this.handleError('An error occurred while finding matching records. ' + errorMessage(err));
                        });

                    // if no (valid) search text, clear the list of records
                    } else {
                        this.records = undefined;
                    }

                }

            } catch (err) {
                this.handleError(errorMessage(err));
                this.records = undefined;
            }
        }

        // handler for when a record is selected
        handleSelect(event){

            const methodName = 'handleSelect';

            try {

                // prevent default behaviour
                event.preventDefault();
            
                // set the selected record
                this.selectedRecord = event.detail;
                
                // console.log(componentName+'.'+methodName+': event received, record.Id: ', this.selectedRecord.Id);
                // console.log(componentName+'.'+methodName+': sending event to parent');
    
                // fire the event with the value of RecordId for the Selected RecordId
                this.dispatchEvent(new CustomEvent(
                    'select',
                    {
                        detail : this.selectedRecord
                    }
                ));

            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // handler for when a record is deselected
        handleRemove(event){

            const methodName = 'handleRemove';

            try {

                // prevent default behaviour
                if (!isEmpty(event)) {
                    event.preventDefault();
                }
    
                // clear the selected records
                this.selectedRecord = undefined;
                this.records = undefined;
                this.noResultsFound = false;
                
                // console.log(componentName+'.'+methodName+': event received');
                // console.log(componentName+'.'+methodName+': sending event to parent');
    
                // fire the event with the value of undefined for the Selected RecordId
                this.dispatchEvent(new CustomEvent(
                    'select',
                    {
                        detail : undefined
                    }
                ));

            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

    // helper methods

        // if processing has errors
        handleError(error) {

            const methodName = 'handleError';
    
            // console.log(componentName+'.'+methodName+': event received');
            // console.log(componentName+'.'+methodName+': error: ', JSON.stringify(error));
    
            try {

                // turn off spinner
                this.showSpinner = false;

                // turn off loading spinner
                this.showLoadingSpinner = false;

                // show error message
                toastError(this, 'Error', error);

            } catch (err) {
                // console.log('Could not display this error message to the user: ' + error);
            }
    
        }
}