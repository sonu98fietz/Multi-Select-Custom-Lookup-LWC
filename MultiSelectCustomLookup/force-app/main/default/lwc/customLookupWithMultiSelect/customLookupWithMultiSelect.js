import {
    LightningElement,
    wire,
    track,
    api
} from 'lwc';

import getCurrentUserTalentDetails from '@salesforce/apex/CustomLookup.getCurrentUserDetails';
import getTalentDetailsImperative from '@salesforce/apex/CustomLookup.getCurrentUserDetailsImperative';


export default class CustomLookupWithMultiSelect extends LightningElement {
    title = '';
    @api mode;
    @api recordId;
    isUserSelectionVisible = true;
    userId ;
    isUsersSelected = false;
    @track selectedUsers = [];
    userDetails = null;
    currentUserDetails = {};
    hasRecordId = false;
    showSpinner = false;
    
    
    
     @wire(getTalentDetailsImperative, {
        userId: '$userId'
    })
    getTalentDetailsImperative({
        data,
        error
    }) {
        if (data) {
           
            if (data.Id) {
                
                this.userDetails = data;
                this.handleAddOfTalent();
            }

        } else if (error) {
            this.showToastMessage('Error', 'Error', error);
        }
    }
    @track isCurrentUserAManager = false;
    handlePriorityOwnerChange(event) {
        
        try {
            let detail = event.detail;
            if (detail) {
                this.userId = detail.Id;
                
            }
        } catch (error) {
            this.showToastMessage('Error', 'Error', error);
        }
    }

    // Resets the look-up field
    handleLookupReset() {
        console.log('here');
        this.userId = null;
        this.userDetails = null;
        this.template.querySelector('c-custom-lookup').clear();
    }

    @wire(getCurrentUserTalentDetails)
    getCurrentUserTalentDetails({
        data,
        error
    }) {
        if (data) {
           
            this.currentUserDetails = data;
            this.isUsersSelected = true;
            this.showSpinner =false;

        } else if (error) {
            this.showToastMessage('Error', 'Error', error);
        }
    }
    // When talent is Added
    handleAddOfTalent() {
       
        let setOfSelectedUserIds = new Set();
        this.selectedUsers.forEach(element => {
            setOfSelectedUserIds.add(element.Id)
        });

        console.log(setOfSelectedUserIds);

        if (setOfSelectedUserIds.has(this.userDetails.Id)) {
            // Do nothing
        } else {
            this.selectedUsers.push(this.userDetails);
        }
        if (this.selectedUsers.length) {
            this.isUsersSelected = true;
        }

        this.validateTalentSelected();
        // reset values
        this.handleLookupReset();
       
    }
    handleRemoveOfTalent(event) {
        let userIdToRemove = event.target.dataset.id;
        this.selectedUsers = this.selectedUsers.filter(object => {
            return object.Id !== userIdToRemove;
        });

        if (this.selectedUsers.length == 0) {
            this.isUsersSelected = false;
        }
    }
     // When one or more user is seleted
     validateTalentSelected() {
        
        if (this.selectedUsers) {
            this.isUsersSelected = true;
        } else {
            this.isUsersSelected = false;
        }
    }
    
    
}