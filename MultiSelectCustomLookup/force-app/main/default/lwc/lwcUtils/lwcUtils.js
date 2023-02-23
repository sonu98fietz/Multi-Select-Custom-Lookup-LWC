export default {errorMessage, isEmpty, isEmptyObject, toastSuccess, toastError, toastInfo, toastWarning, scrollToTop, getFieldFromSObject, currentDateTime, currentLocalDate, currentLocalDateTime, formattedSFDate, daysBetween, randomNumber, possessiveName, updatePageReference, reportFieldValidity}

/* eslint-disable no-console */

// extracts the error message from LWC errors
export function errorMessage(errors) {

    // console.log('lwcUtils.errorMessage: errors: ', JSON.stringify(errors));

    var result = '';

    if (!isEmpty(errors)) {

        if (!Array.isArray(errors)) {
            // console.log('lwcUtils.errorMessage: adding error to array');
            errors = [errors];
        }

        // console.log('lwcUtils.errorMessage: errors (after filter): ', JSON.stringify(errors.filter(error => !!error)));

        let i = 0;

        errors =
            errors
                // Remove null/undefined items
                .filter(error => !!error)
                // Extract an error message
                .map(error => {

                    // console.log('lwcUtils.errorMessage: error # ' + i);
                    i++;
                    // console.log('lwcUtils.errorMessage: error: ', JSON.stringify(error));
                    
                    // UI API read errors
                    if (Array.isArray(error.body)) {
                        // console.log('lwcUtils.errorMessage: UI API read errors');
                        // console.log('lwcUtils.errorMessage: error.body: ', JSON.stringify(error.body));
                        let errorBodyMap = error.body.map(e => e.message);
                        // console.log('lwcUtils.errorMessage: errorBodyMap: ', JSON.stringify(errorBodyMap));
                        return errorBodyMap;

                    // Apex page validation errors
                    } else if (error.body && error.body.output && error.body.output.errors && error.body.output.errors.length > 0) {
                        // console.log('lwcUtils.errorMessage: Apex page validation errors');
                        // console.log('lwcUtils.errorMessage: error.body.output.errors: ', JSON.stringify(error.body.output.errors));

                        // return the first page level error
                        return error.body.output.errors[0].message; 

                    // Apex field validation errors
                    } else if (error.body && error.body.output && error.body.output.fieldErrors) {
                        // console.log('lwcUtils.errorMessage: Apex field validation errors');
                        // console.log('lwcUtils.errorMessage: error.body.output.fieldErrors: ', JSON.stringify(error.body.output.fieldErrors));

                        let errMessage;

                        // get the first field that had an error
                        Object.keys(error.body.output.fieldErrors).forEach(fieldApiName => {
                            // console.log('lwcUtils.errorMessage: fieldApiName: ', JSON.stringify(fieldApiName));

                            // get the first error for the first field
                            if (error.body.output.fieldErrors[fieldApiName].length > 0) {
                                let e = error.body.output.fieldErrors[fieldApiName][0];
                                // console.log('lwcUtils.errorMessage: e: ', JSON.stringify(e));

                                // if this is the first error found
                                if (errMessage === undefined) {
                                    errMessage = e.fieldLabel + ': ' + e.message;
                                }
                            }

                        });

                        // console.log('lwcUtils.errorMessage: errMessage: ', JSON.stringify(errMessage));

                        // define the message to return
                        return errMessage;

                    // Apex page validation errors (alternate output)
                    } else if (error.body && error.body.pageErrors && error.body.pageErrors.length > 0) {
                        // console.log('lwcUtils.errorMessage: Apex page validation errors (alternate output)');
                        // console.log('lwcUtils.errorMessage: error.body.pageErrors: ', JSON.stringify(error.body.pageErrors));

                        // return the first page level error
                        return error.body.pageErrors[0].message; 

                    // Apex field validation errors (alternate output)
                    } else if (error.body && error.body.fieldErrors) {
                        // console.log('lwcUtils.errorMessage: Apex field validation errors (alternate output)');
                        // console.log('lwcUtils.errorMessage: error.body.fieldErrors: ', JSON.stringify(error.body.fieldErrors));

                        let errMessage;

                        // get the first field that had an error
                        Object.keys(error.body.fieldErrors).forEach(fieldApiName => {
                            // console.log('lwcUtils.errorMessage: fieldApiName: ', JSON.stringify(fieldApiName));

                            // get the first error for the first field
                            if (error.body.fieldErrors[fieldApiName].length > 0) {
                                let e = error.body.fieldErrors[fieldApiName][0];
                                // console.log('lwcUtils.errorMessage: e: ', JSON.stringify(e));

                                // if this is the first error found
                                if (errMessage === undefined) {
                                    errMessage = fieldApiName + ': ' + e.message;
                                }
                            }

                        });

                        // console.log('lwcUtils.errorMessage: errMessage: ', JSON.stringify(errMessage));

                        // define the message to return
                        return errMessage;

                    // UI API DML, Apex and network errors
                    } else if (error.body && typeof error.body.message === 'string') {
                        // console.log('lwcUtils.errorMessage: UI API DML, Apex and network errors');
                        // console.log('lwcUtils.errorMessage: error.body.message: ', JSON.stringify(error.body.message));
                        return error.body.message;

                    // Event detail message
                    } else if (error.detail && typeof error.detail.message === 'string') {
                        // console.log('lwcUtils.errorMessage: Event detail message');
                        // console.log('lwcUtils.errorMessage: error.detail: ', JSON.stringify(error.detail));
                        // console.log('lwcUtils.errorMessage: error.detail.message: ', JSON.stringify(error.detail.message));

                        let message = error.detail.message;
                        
                        return message;

                    // Event detail message
                    } else if (error.detail && typeof error.detail === 'string') {
                        // console.log('lwcUtils.errorMessage: Event detail message');
                        // console.log('lwcUtils.errorMessage: error.detail: ', JSON.stringify(error.detail));
                        // console.log('lwcUtils.errorMessage: typeof error.detail: ', typeof error.detail);

                        let message = error.detail;

                        return message; 

                    // Event detail message
                    } else if (error.message && typeof error.message === 'string') {
                        // console.log('lwcUtils.errorMessage: Event detail message');
                        // console.log('lwcUtils.errorMessage: error.message: ', JSON.stringify(error.message));
                        // console.log('lwcUtils.errorMessage: typeof error.message: ', typeof error.message);

                        let message = error.message;

                        return message;                            

                    // JS errors
                    } else if (typeof error.message === 'string') {
                        // console.log('lwcUtils.errorMessage: JS errors');
                        // NOTE: do not comment this line
                        // console.log('Exception caught: ', error.stack);
                        // console.log('lwcUtils.errorMessage: error.message: ', JSON.stringify(error.message));
                        return error.message;
                    }

                    // Unknown error shape so try HTTP status text
                    // console.log('lwcUtils.errorMessage: Unknown error shape so try HTTP status text');
                    // console.log('lwcUtils.errorMessage: error.statusText: ', JSON.stringify(error.statusText));
                    return error.statusText;
                })
                // Flatten
                .reduce((prev, curr) => prev.concat(curr), [])
                // Remove empty strings
                .filter(message => !!message)
        ;

        // console.log('lwcUtils.errorMessage: after error filter, map, reduce');

        for (i = 0; i < errors.length; i++) {
            if (i > 0) {
                result += ', ';
            }
            result += errors[i];
        }

        // console.log('lwcUtils.errorMessage: result (before substitution): ' + result);

        // character substitutions
        result = result.replace(/&quot;/gi, '"');
        result = result.replace(/&apos;/gi, "'");
        result = result.replace(/&lt;/gi, '<');
        result = result.replace(/&gt;/gi, '>');

        // console.log('lwcUtils.errorMessage: result (after substitution): ' + result);

    }

    return result;
}

// returns true if the variable is empty
export function isEmpty(val) {
    var result;
    if (Array.isArray(val) && val.length === 0) {
        result = true;
    } else if (val === null || val === undefined || val === '' || val === 'null') {
        result = true;
    } else {
        result = false;
    }
    return result;
}

// returns true if the variable is empty
export function isEmptyObject(val) {
    var result;
    if ((val instanceof Object) && Object.keys(val).length === 0) {
        result = true;
    } else {
        result = false;
    }
    return result;
}

// used for toast events
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// shows a success toast message
export function toastSuccess(component, title, message, messageData, mode) {

    // if message data is empty, initialize it
    if (isEmpty(messageData)) {
        messageData = [];
    }

    if (isEmpty(mode)) {
        mode = 'dismissable';
    }
    
    // build the event
    let toastEvent = new ShowToastEvent({
        title: title,
        message: message,
        messageData : messageData,
        variant: 'success',
        duration: 3,
        mode: mode
    });

    // dispatch the event
    component.dispatchEvent(toastEvent);
}

// shows an error toast message
export function toastError(component, title, message, messageData, mode) {

    // if message data is empty, initialize it
    if (isEmpty(messageData)) {
        messageData = [];
    }

    if (isEmpty(mode)) {
        mode = 'pester';
    }
    
    // build the event
    let toastEvent = new ShowToastEvent({
        title: title,
        message: message,
        messageData : messageData,
        variant: 'error',
        mode: mode
    });

    // dispatch the event
    component.dispatchEvent(toastEvent);
}

// shows an info toast message
export function toastInfo(component, title, message, messageData, mode) {

    // if message data is empty, initialize it
    if (isEmpty(messageData)) {
        messageData = [];
    }

    if (isEmpty(mode)) {
        mode = 'dismissable';
    }
    
    // build the event
    let toastEvent = new ShowToastEvent({
        title: title,
        message: message,
        messageData : messageData,
        variant: 'info',
        duration: 3,
        mode: mode
    });

    // dispatch the event
    component.dispatchEvent(toastEvent);
}

// shows a warning toast message
export function toastWarning(component, title, message, messageData, mode) {

    // if message data is empty, initialize it
    if (isEmpty(messageData)) {
        messageData = [];
    }

    if (isEmpty(mode)) {
        mode = 'dismissable';
    }
    
    // build the event
    let toastEvent = new ShowToastEvent({
        title: title,
        message: message,
        messageData : messageData,
        variant: 'warning',
        duration: 3,
        mode: mode
    });

    // dispatch the event
    component.dispatchEvent(toastEvent);
}

// scrolls to the top of the window
// scrollType = auto|smooth
export function scrollToTop(scrollType, top, left) {

    // set default settings
    if (isEmpty(scrollType)) {
        scrollType = 'smooth';
    }
    if (isEmpty(top)) {
        top = 0;
    }
    if (isEmpty(left)) {
        left = 0;
    }
    
    // set the options
    let scrollOptions = {
        top: top,
        left: left,
        behavior: scrollType
    }

    // perform scroll
    window.scrollTo(scrollOptions);
}

// get the value from an sobject result
// support compound fields in the format relationship.fieldname (ex. Owner.Name)
export function getFieldFromSObject(data, field) {

    // console.log('lwcUtils.getFieldFromSObject: field: ' + JSON.stringify(field));

    let result;

    try {

        // check if compound field
        if (!isEmpty(field)) {
            let splitIndex = field.indexOf('.');

            // if compound field
            if (splitIndex !== -1) {
                // console.log('lwcUtils.getFieldFromSObject: is a compound field');

                let objectName = field.substring(0, splitIndex); 
                let newField = field.substring(splitIndex + 1, field.length);
                // console.log('lwcUtils.getFieldFromSObject: splitIndex: ' + JSON.stringify(splitIndex));
                // console.log('lwcUtils.getFieldFromSObject: objectName: ' + JSON.stringify(objectName));
                // console.log('lwcUtils.getFieldFromSObject: newField: ' + JSON.stringify(newField));
            
                // recurse into the object if it exists
                if (!isEmpty(data[objectName])) {
                    result = this.getFieldFromSObject(data[objectName], newField);
                } else {
                    result = undefined;
                }

            // not compound field, get value from object
            } else {
                let value = data[field];
                result = value;
            }
        }

    } catch (e) {
        let errMessage = 'An error occurred getting the field ' + field + ' from the provided record. Exception: ' + errorMessage(e);
        // console.log('lwcUtils.getFieldFromSObject: errMessage: ' + JSON.stringify(errMessage));
        toastError(this, 'Error', errMessage);
    }

    // console.log('lwcUtils.getFieldFromSObject: result: ' + JSON.stringify(result));

    return result;

}

// returns a javascript date object of the current time in UTC Time
export function currentDateTime() {
    var utcDate = new Date();    
    return utcDate;
}

// returns the current date in YYYY-MM-DD format in local time
export function currentLocalDate() {
    var utcDate = new Date();    
    var localDateCalc = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
    var localYYYYMMDD = localDateCalc.toISOString().split('T')[0]; 
    return localYYYYMMDD;
}

// returns a javascript date object of the current time in Local Time
export function currentLocalDateTime() {
    var utcDate = new Date();    
    var localDateCalc = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
    return localDateCalc;
}

// sfDate: YYYY-MM-DD formatted date
// options = { weekday: 'short|long', year: 'numeric', month: 'numeric|long|short', day: 'numeric' }
// -- Example: Jun 23, 2022  >> options = { year: 'numeric', month: 'short', day: 'numeric' };
// -- Example: June 23, 2022 >> options = { year: 'numeric', month: 'long', day: 'numeric' };
// -- Example: 7/23/2022     >> options = { year: 'numeric', month: 'numeric', day: 'numeric' };
export function formattedSFDate(sfDate, options, locale) {

    let result;

    // set defaults
    if (isEmpty(locale)) {
        locale = 'en-US';
    }
	
    // extract date from the string
    if (!isEmpty(sfDate)) {

        let year = sfDate.substring(0, 4);
        let month = sfDate.substring(5, 7);
        let month0Based = (parseInt(month, 10) - 1);
        let day = sfDate.substring(8, 10);

        // initialize javascript date
        let date = new Date(year, month0Based, day);

        // convert to locale string
        result = date.toLocaleDateString(locale, options);

    }
    
	return result;

}

// calculate the number of days betwen dateObj1 and dateObj2
// if dateObj1 > dateObj2, the result will be positive
// if dateObj1 < dateObj2, the result will be negative
// dateObj1: a javascript date object
// dateObj2: a javascript date object
// if the date objects have a different time (hrs/min/seconds), you'll end up with a decimal that you'll need to floor, ceiling, or round
export function daysBetween(dateObj1, dateObj2) {

    let result;

    if (!isEmpty(dateObj1) && !isEmpty(dateObj2)) {
        let timeDifference = dateObj1.getTime() - dateObj2.getTime();
        result = timeDifference / (1000 * 3600 * 24);
    }

    return result;

}

// generate a random 16-digit number
export function randomNumber() {
    return Math.random().toString().substr(2, 16);
}

// make a person's name possessive
// example: Mary becomes Mary's
// example: James becomes James'
export function possessiveName(name) {
    
    if (name != null) {
        if (name.substr(name.length - 1) === 's') {
            name += '\'';
        } else {
            name += '\'s';
        }
    }

    return name;

}

// return the provided page reference, updating its state with the specified stateChanges
// currentPageReference: comes from NavigationMixIn: @wire(CurrentPageReference)
// stageChanges: json object of query string parameters to change
//   example: { c__name1: value1, c__name2: value2 }
//   state properties must begin with 'c__'
export function updatePageReference(currentPageReference, stateChanges) {
    return Object.assign({}, currentPageReference, {
      state: Object.assign({}, currentPageReference.state, stateChanges)
    });
}

// loop through the specified lightning input fields and 
// return false if any of the selected lightning input fields reportValidity() is false
export function reportFieldValidity(component, selectors) {

    // console.log('lwcUtils.reportFieldValidity: start');
    // console.log('lwcUtils.reportFieldValidity: selectors: ' + JSON.stringify(selectors));

    // if selectors not specified, select all the fields that support reportValidity
    if (isEmpty(selectors)) {
        selectors = 'lightning-input, lightning-input-address, lightning-combobox, lightning-radio-group, lightning-textarea';
    }

    // console.log('lwcUtils.reportFieldValidity: selectors: ' + JSON.stringify(selectors));
    
    // select the fields identified by their selectors
    let elements = component.template.querySelectorAll(selectors);

    // initialize result
    let isValid = true;

    // loop through the found fields
    if (!isEmpty(elements)) {
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];

            // check field's validity AND report it to the user interface
            let result = element.reportValidity();
            // console.log('lwcUtils.reportFieldValidity: result: ' + JSON.stringify(result));

            // if invalid, set the result
            if (result === false) {
                isValid = false;
            }
        }
    }

    // console.log('lwcUtils.reportFieldValidity: isValid: ' + JSON.stringify(isValid));

    return isValid;

}