public with sharing class CustomLookup {

    // class name, for debug output
    @TestVisible private static String className = 'CustomLookup';

    // flag to set different modes for testing
    @TestVisible private static Integer testMode = 0;

    // flag for tracking if any errors occurred
    @TestVisible private static Boolean hasErrors = false;

    // flag on whether to show debug statements for this class
    @TestVisible private static Boolean debug = false;

    // custom exception
    public class QueryException extends Exception {}

    public class SearchResults {

        public String searchId = null;
        public List<sObject> results = new List<sObject>();

        public SearchResults(String searchId, List<sObject> results) {
            this.searchId = searchId;
            this.results = results;
        }
    }

    // query records from objectName where searchString is found within searchField
    // returns a JSON stringified SearchResults object

    // parameters:
    // searchString: the user provided string to search for
    // objectName: the API name of the object to search against
    // displayFields: a comma separated list of fields to display in the search result, in order
    // additionalCriteria: any additional criteria to apply to the WHERE condition of the SOQL query
    // additionalFields: any additional fields to return in the dataset, without being displayed
    // orderBy: list of fields to order by in the format: FieldName1 ASC|DESC, FieldName2 ASC|DESC, etc.
    // securityEnforced: true|false, true: return an error if attempting to query a field a user doesn't have FLS access to, false: don't return an error
    // stripInaccessible: true|false, true: strip the results from any fields that the user doesn't have access to, false: don't strip fields
    // searchId: a unique identifier for this search that will be returned in the search results
    // getCurrentUserDetails

    // getting all user details
    @AuraEnabled(cacheable = true)
    public static List<User> getCurrentUserDetails(){

        String methodName = 'getCurrentUserDetails';

        List<User> userDataList = [select Id,Name,MediumPhotoUrl From User];
        if (debug) system.debug(className + '.' + methodName + ': userDataList: ' + userDataList);

		return userDataList;   
    }
    // Getting user details with user record Id
    @AuraEnabled(cacheable = true)
    public static User getCurrentUserDetailsImperative(string userId){

        String methodName = 'getCurrentUserDetailsImperative';
        
        if(String.isEmpty(userId)){
            return new User();
        }try{

            User userData = [select Id,Name,MediumPhotoUrl From User WHERE id=:userId];

            if (debug) system.debug(className + '.' + methodName + ': userData: ' + userData);

		    return userData;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
         
    }

    // all parameters
    @AuraEnabled(cacheable=true)
    public static String findRecords(String searchType, String searchString, String objectName, String searchFields, String displayFields, String additionalFields, String additionalCriteria, String orderBy, Boolean securityEnforced, Boolean stripInaccessible, String searchId){

        String methodName = 'findRecords';

        if (debug) system.debug(className + '.' + methodName + ': start');
        if (debug) system.debug(className + '.' + methodName + ': searchType: ' + searchType);
        if (debug) system.debug(className + '.' + methodName + ': searchString: ' + searchString);
        if (debug) system.debug(className + '.' + methodName + ': objectName: ' + objectName);
        if (debug) system.debug(className + '.' + methodName + ': searchFields: ' + searchFields);
        if (debug) system.debug(className + '.' + methodName + ': displayFields: ' + displayFields);
        if (debug) system.debug(className + '.' + methodName + ': additionalFields: ' + additionalFields);
        if (debug) system.debug(className + '.' + methodName + ': additionalCriteria: ' + additionalCriteria);
        if (debug) system.debug(className + '.' + methodName + ': orderBy: ' + orderBy);
        if (debug) system.debug(className + '.' + methodName + ': securityEnforced: ' + securityEnforced);
        if (debug) system.debug(className + '.' + methodName + ': stripInaccessible: ' + stripInaccessible);
        if (debug) system.debug(className + '.' + methodName + ': searchId: ' + searchId);

        // initialize result
        List<SObject> records = new List<SObject>();

        if (searchString != null && (searchType == 'SOQL' || searchType == 'SOSL')) {

            String queryString;

            // define the value to search
            String key = '%' + searchString + '%';

            // build the query string
            queryString = buildFindQuery(searchType, searchString, objectName, searchFields, displayFields, additionalFields, additionalCriteria, orderBy, securityEnforced);
            if (debug) system.debug(className + '.' + methodName + ': queryString: ' + queryString);
            
            if (queryString != null) {

                // execute query
                if (searchType == 'SOQL') {
                    records = Database.query(queryString);
                } else if (searchType == 'SOSL') {
                    List<List<sObject>> soslResults = search.query(queryString);
                    if (soslResults.isEmpty() == false) {
                        records = soslResults[0];
                    }
                }

                // Strip fields that are not readable to the user
                if (stripInaccessible) {
                    SObjectAccessDecision decisionResult = Security.stripInaccessible( AccessType.READABLE, records);
                    records = decisionResult.getRecords();
                }
            }
        }

        // define search results
        SearchResults results = new SearchResults(searchId, records);
        if (debug) system.debug(className + '.' + methodName + ': results: ' + results);

        return JSON.serialize(results);

    }

    // define the SOSL search groups that are allowed
    private static Set<String> soslSearchGroups = new Set<String>{
        'ALL FIELDS',
        'NAME FIELDS',
        'EMAIL FIELDS',
        'PHONE FIELDS',
        'SIDEBAR FIELDS'
    };

    // build the SOQL query based on the parameters provided
    public static String buildFindQuery(String searchType, String searchString, String objectName, String searchFields, String displayFields, String additionalFields, String additionalCriteria, String orderBy, Boolean securityEnforced) {

        String methodName = 'buildFindQuery';

        if (debug) system.debug(className + '.' + methodName + ': start');
        if (debug) system.debug(className + '.' + methodName + ': searchType: ' + searchType);
        if (debug) system.debug(className + '.' + methodName + ': searchString: ' + searchString);
        if (debug) system.debug(className + '.' + methodName + ': objectName: ' + objectName);
        if (debug) system.debug(className + '.' + methodName + ': searchFields: ' + searchFields);
        if (debug) system.debug(className + '.' + methodName + ': displayFields: ' + displayFields);
        if (debug) system.debug(className + '.' + methodName + ': additionalFields: ' + additionalFields);
        if (debug) system.debug(className + '.' + methodName + ': additionalCriteria: ' + additionalCriteria);
        if (debug) system.debug(className + '.' + methodName + ': securityEnforced: ' + securityEnforced);
        if (debug) system.debug(className + '.' + methodName + ': orderBy: ' + orderBy);

        String queryString = null;

        if (String.isBlank(searchString) == false && (searchType == 'SOQL' || searchType == 'SOSL')) {

            // build the list of fields to query
            Set<String> queryFields = new Set<String>();
            queryFields.add('Id');

            if (displayFields != null) {
                Set<String> displayFieldsSet = SplitUtils.toSetOfStrings(displayFields, ',', true);
                if (displayFieldsSet.isEmpty() == false) {
                    queryFields.addAll(displayFieldsSet);
                }
            }

            if (additionalFields != null) {
                Set<String> additionalFieldsSet = SplitUtils.toSetOfStrings(additionalFields, ',', true);
                if (additionalFieldsSet.isEmpty() == false) {
                    queryFields.addAll(additionalFieldsSet);
                }
            }

            if (debug) system.debug(className + '.' + methodName + ': queryFields: ' + queryFields);

            // SOQL search
            if (searchType == 'SOQL' && String.isBlank(searchFields) == false) {

                // select Id, displayFields and additionalFields
                queryString = 'SELECT ' + CSVUtils.csvString(queryFields, false, true, ',');

                // from the object
                queryString += ' FROM '+objectName;

                // build WHERE condition
                queryString += ' WHERE ';

                    // search criteria
                    Set<String> searchFieldsSet = SplitUtils.toSetOfStrings(searchFields, ',', true);

                    queryString += '(';
                    Integer i = 0;
                    for (String searchField : searchFieldsSet) {
                        if (i > 0) {
                            queryString += ' OR ';
                        }
                        queryString += searchField +' LIKE :key';
                        i++;
                    }
                    queryString += ')';

                // add any additional criteria
                    if (String.isBlank(additionalCriteria) == false) {
                        queryString += ' AND ' + additionalCriteria;
                    }
                
                // add order by
                if (String.isBlank(orderBy) == false) {
                    queryString += ' ORDER BY ' + orderBy;
                }

                // add security
                if (securityEnforced) {
                    queryString += ' WITH SECURITY_ENFORCED';
                }

            // SOSL search
            } else if (searchType == 'SOSL') {

                // set default search fields
                if (String.isBlank(searchFields)) {
                    searchFields = 'ALL FIELDS';
                }

                // invalid search fields
                if (soslSearchGroups.contains(searchFields) == false) {
                    throw new QueryException('Specifying specific fields to search is not supported on SOSL searches, please remove this setting or specify one of the following search groups: ' + CSVUtils.csvString(soslSearchGroups, false, true, ', '));
                }

                // invalid parameter
                if (securityEnforced) {
                    throw new QueryException('SECURITY_ENFORCED not supported on SOSL searches, please remove this setting or switch to SOQL');
                }

                queryString = 'FIND \'' + String.escapeSingleQuotes(searchString) + '\'';
                queryString += ' IN ' + searchFields;
                queryString += ' RETURNING ' + objectName;

                queryString += '(';
                queryString += CSVUtils.csvString(queryFields, false, true, ',');

                // add any additional criteria
                if (String.isBlank(additionalCriteria) == false) {
                    queryString += ' WHERE ' + additionalCriteria;
                }

                // add order by
                if (String.isBlank(orderBy) == false) {
                    queryString += ' ORDER BY ' + orderBy;
                }

                queryString += ')';

            }

        }

        if (debug) system.debug(className + '.' + methodName + ': queryString: ' + queryString);

        return queryString;

    }

    @AuraEnabled(cacheable = true)
    public static sObject getRecord(Id recordId, String objectName, String displayFields, String additionalFields, Boolean securityEnforced, Boolean stripInaccessible) {

        String methodName = 'getRecord';

        if (debug) system.debug(className + '.' + methodName + ': start');

        if (debug) system.debug(className + '.' + methodName + ': recordId: ' + recordId);
        if (debug) system.debug(className + '.' + methodName + ': objectName: ' + objectName);
        if (debug) system.debug(className + '.' + methodName + ': displayFields: ' + displayFields);
        if (debug) system.debug(className + '.' + methodName + ': additionalFields: ' + additionalFields);
        if (debug) system.debug(className + '.' + methodName + ': securityEnforced: ' + securityEnforced);

        sObject result = null;
        
        if (recordId != null) {

            // build query
            String queryString = buildGetQuery(recordId, objectName, displayFields, additionalFields, securityEnforced);
            if (debug) system.debug(className + '.' + methodName + ': queryString: ' + queryString);

            // execute query
            List<sObject> results = Database.query(queryString);

            // Strip fields that are not readable to the user
            if (stripInaccessible) {
                SObjectAccessDecision decisionResult = Security.stripInaccessible( AccessType.READABLE, results);
                results = decisionResult.getRecords();
            }

            if (results.isEmpty() == false) {
                result = results[0];
            }
        }

        return result;
    }

// build the SOQL query based on the parameters provided
public static String buildGetQuery(Id recordId, String objectName, String displayFields, String additionalFields, Boolean securityEnforced) {

    String methodName = 'buildGetQuery';

    if (debug) system.debug(className + '.' + methodName + ': start');
    if (debug) system.debug(className + '.' + methodName + ': recordId: ' + recordId);
    if (debug) system.debug(className + '.' + methodName + ': objectName: ' + objectName);
    if (debug) system.debug(className + '.' + methodName + ': displayFields: ' + displayFields);
    if (debug) system.debug(className + '.' + methodName + ': additionalFields: ' + additionalFields);
    if (debug) system.debug(className + '.' + methodName + ': securityEnforced: ' + securityEnforced);

    String queryString = null;

    if (recordId != null) {

        // build the list of fields to query
        Set<String> queryFields = new Set<String>();
        queryFields.add('Id');

        if (displayFields != null) {
            Set<String> displayFieldsSet = SplitUtils.toSetOfStrings(displayFields, ',', true);
            if (displayFieldsSet.isEmpty() == false) {
                queryFields.addAll(displayFieldsSet);
            }
        }

        if (additionalFields != null) {
            Set<String> additionalFieldsSet = SplitUtils.toSetOfStrings(additionalFields, ',', true);
            if (additionalFieldsSet.isEmpty() == false) {
                queryFields.addAll(additionalFieldsSet);
            }
        }

        queryString = 'SELECT ' + CSVUtils.csvString(queryFields, false, true, ',') + ' FROM '+objectName +' WHERE Id = :recordId';

        if (securityEnforced) {
            queryString += ' WITH SECURITY_ENFORCED';
        }

        queryString += ' LIMIT 1';

    }

    if (debug) system.debug(className + '.' + methodName + ': queryString: ' + queryString);

    return queryString;

}

    // get the UI Theme
    // Theme1: Obsolete Salesforce theme
    // Theme2: Salesforce Classic 2005 user interface theme
    // Theme3: Salesforce Classic 2010 user interface theme
    // Theme4d: Modern “Lightning Experience” Salesforce theme
    // Theme4t: Salesforce mobile app theme
    // Theme4u: Lightning Console theme
    // PortalDefault: Salesforce Customer Portal theme
    // Webstore: Salesforce AppExchange theme
    @AuraEnabled(cacheable=true)
    public static String getUITheme() {
        String theme = UserInfo.getUiThemeDisplayed();
        return theme;
    }

}