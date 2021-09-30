"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mendixmodelsdk_1 = require("mendixmodelsdk");
const when = require("when");
export class MendixModelComponents {
    constructor(model) {
        this._model = model;
    }
    model() {
        return this._model;
    }
    /*
    *
    * PROJECT STRUCTURE
    *
    */
    createModule(project, name) {
        const mxModule = mendixmodelsdk_1.projects.Module.createIn(project);
        mxModule.domainModel = mendixmodelsdk_1.domainmodels.DomainModel.createIn(mxModule);
        mxModule.name = name;
        return mxModule;
    }
    /*
    *
    * DOMAIN MODEL
    *
    */
    createEntity(domainModel, name, xLoc, yLoc) {
        const entity = mendixmodelsdk_1.domainmodels.Entity.createIn(domainModel);
        entity.name = name;
        entity.location = { x: xLoc, y: yLoc };
        return entity;
    }
    addAutoNumberAttribute(entity, name, defaultValue) {
        const value = mendixmodelsdk_1.domainmodels.StoredValue.create(this.model());
        value.defaultValue = defaultValue;
        const type = mendixmodelsdk_1.domainmodels.AutoNumberAttributeType.create(this.model());
        const attribute = this.createNewUntypedAttribute(entity, name, type, value);
        return attribute;
    }
    addIntegerAttribute(entity, name) {
        return this.createNewUntypedAttribute(entity, name, mendixmodelsdk_1.domainmodels.IntegerAttributeType.create(this.model()));
    }
    addDateTimeAttribute(entity, name) {
        return this.createNewUntypedAttribute(entity, name, mendixmodelsdk_1.domainmodels.DateTimeAttributeType.create(this.model()));
    }
    addStringAttribute(entity, name, defaultValue) {
        const type = mendixmodelsdk_1.domainmodels.StringAttributeType.create(this.model());
        if (defaultValue) {
            const value = mendixmodelsdk_1.domainmodels.StoredValue.create(this.model());
            value.defaultValue = defaultValue;
            return this.createNewUntypedAttribute(entity, name, type, value);
        }
        else {
            return this.createNewUntypedAttribute(entity, name, type);
        }
    }
    createNewUntypedAttribute(entity, name, type, value) {
        const attribute = mendixmodelsdk_1.domainmodels.Attribute.createIn(entity);
        attribute.name = name;
        attribute.type = type;
        if (value) {
            attribute.value = value;
        }
        return attribute;
    }
    associate(domainModel, source, target, name) {
        let association = mendixmodelsdk_1.domainmodels.Association.createIn(domainModel);
        association.parent = source;
        association.child = target;
        association.name = name;
        association.parentConnection = { "x": 0, "y": 30 };
        association.childConnection = { "x": 100, "y": 30 };
        return association;
    }
    /*
     *
     * PAGES
     *
     */
    createListPageForEntity(entity, sortAttribute, layout, layoutPlaceholderName, editPage) {
        let table = this.createTableForEntity(entity);
        let listView = this.createListViewForEntity(entity, sortAttribute);
        listView.widget = table;
        listView.clickAction = this.createPageAction(editPage, 'Edit ' + entity.name);
        let layoutCall = this.createLayoutCall(layout);
        let layoutCallArgument = this.createLayoutCallArgument(layoutCall, layoutPlaceholderName, listView);
        return this.createPage(entity.containerAsDomainModel.containerAsModule, entity.name + '_List', entity.name + 's', layoutCall);
    }
    createPageAction(page, pageTitle) {
        let action = mendixmodelsdk_1.pages.PageClientAction.create(this.model());
        action.pageSettings = mendixmodelsdk_1.pages.PageSettings.create(this.model());
        action.pageSettings.page = page;
        action.pageSettings.formTitle = this.createText(pageTitle);
        return action;
    }
    createEditPageForEntity(entity, layout, layoutPlaceholderName) {
        let dataview = this.createDataViewForEntity(entity);
        let layoutCall = this.createLayoutCall(layout);
        let layoutCallArgument = this.createLayoutCallArgument(layoutCall, layoutPlaceholderName, dataview);
        return this.createPage(entity.containerAsDomainModel.containerAsModule, entity.name + '_Edit', 'Edit ' + entity.name, layoutCall);
    }
    createPage(module, name, title, layoutCall) {
        let page = mendixmodelsdk_1.pages.Page.createIn(module);
        page.name = name;
        page.title = this.createText(title);
        page.layoutCall = layoutCall;
        return page;
    }
    createPlaceholder(name) {
        let placeholder = mendixmodelsdk_1.pages.Placeholder.create(this.model());
        placeholder.name = name;
        return placeholder;
    }
    retrieveLayout(project, qualifiedName) {
        return when.promise((resolve, reject) => {
            let layouts = project.allLayouts().filter(l => l.qualifiedName === qualifiedName);
            if (layouts.length !== 1) {
                console.log('WARNING: layouts.length !== 1');
                console.log(layouts);
            }
            let layout = layouts[0];
            layout.load(l => {
                resolve(l);
            });
        });
    }
    createLayout(module, name, mainPlaceholder) {
        // TODO: Setting main placeholder does not work. Using existing layout instead ... :-(
        //let mainPlaceholderParameter = new pages.LayoutParameter();
        //mainPlaceholderParameter.name = mainPlaceholder.name;
        let layout = mendixmodelsdk_1.pages.Layout.createIn(module);
        layout.name = name;
        layout.widget = mainPlaceholder;
        //layout.mainPlaceholder = layout.parameters.filter(p => p.name === mainPlaceholder.name)[0];
        return layout;
    }
    createLayoutCallArgument(layoutCall, parameterName, widget) {
        let argument = mendixmodelsdk_1.pages.LayoutCallArgument.createIn(layoutCall);
        argument.parameterName = parameterName;
        argument.widget = widget;
        return argument;
    }
    createLayoutCall(layout) {
        let layoutCall = mendixmodelsdk_1.pages.LayoutCall.create(this.model());
        layoutCall.layout = layout;
        return layoutCall;
    }
    createListViewForEntity(entity, sortAttribute) {
        let lvSource = this.createListViewSourceForEntity(entity, sortAttribute);
        let listView = this.createListView(entity.name + 'ListView', lvSource);
        return listView;
    }
    createListViewSourceForEntity(entity, sortAttribute) {
        // Feedback items on types of data sources:
        // WM: 157790: [MM] ListView.dataSource (& other grid datasources) does not properly restrict assignment to allowed subset of compatible subtypes
        // DM: 157786: [MM] ListView.dataSource (& other grid datasources) does not properly restrict assignment to allowed subset of compatible subtypes
        let listViewSource = mendixmodelsdk_1.pages.ListViewDatabaseSource.create(this.model());
        listViewSource.entityPath = entity.name;
        listViewSource.sortBar = mendixmodelsdk_1.pages.GridSortBar.create(this.model()); // WM 157809: ListViewSource.sortBar misses default value
        if (sortAttribute) {
            let sortItem = mendixmodelsdk_1.pages.GridSortItem.createIn(listViewSource.sortBar);
            sortItem.attributePath = this.qualifiedNameOfAttribute(sortAttribute);
        }
        return listViewSource;
    }
    createListView(name, dataSource) {
        let listView = mendixmodelsdk_1.pages.ListView.create(this.model());
        listView.name = name;
        listView.dataSource = dataSource;
        listView.clickAction = mendixmodelsdk_1.pages.NoClientAction.create(this.model()); // DM: 157812: [MM] ListView.clickAction default is missing
        return listView;
    }
    createDataViewForEntity(entity) {
        let table = this.createTableForEntity(entity);
        return this.createDataView(entity.name + 'DataView', this.createDataViewSource(entity.name), table);
    }
    createTableForEntity(entity) {
        let table = this.createTable(entity.name + 'Table');
        this.createTableColumn(table, 25);
        this.createTableColumn(table, 75);
        this.addTableRows(table, entity.attributes.length);
        for (var row = 0; row < entity.attributes.length; row++) {
            let attribute = entity.attributes[row];
            let cell = this.createTableCell(table, row, 0, 1, 1, this.createLabelForAttribute(attribute));
            this.createTableCell(table, row, 1, 1, 1, this.createInputForAttribute(attribute));
        }
        return table;
    }
    createDataView(name, dataSource, widget) {
        let dataView = mendixmodelsdk_1.pages.DataView.create(this.model());
        dataView.name = name;
        dataView.dataSource = dataSource;
        dataView.widget = widget;
        // DM: 157291: [MM] Default values DataViewSource for DV.dataSource & DataViewControlBar for DV.controlBar missing
        if (this.model().metaModelVersion.isBefore(new mendixmodelsdk_1.Version(6, 7, 0))) {
            dataView.controlBar = mendixmodelsdk_1.pages.DataViewControlBar.create(this.model());
        }
        dataView.noEntityMessage = this.createText('');
        return dataView;
    }
    createDataViewSource(entityPath) {
        let dvSource = mendixmodelsdk_1.pages.DataViewSource.create(this.model());
        dvSource.entityPath = entityPath;
        return dvSource;
    }
    createInputForAttribute(attribute) {
        if (attribute.type instanceof mendixmodelsdk_1.domainmodels.StringAttributeType ||
            attribute.type instanceof mendixmodelsdk_1.domainmodels.AutoNumberAttributeType ||
            attribute.type instanceof mendixmodelsdk_1.domainmodels.CurrencyAttributeType ||
            attribute.type instanceof mendixmodelsdk_1.domainmodels.DecimalAttributeType ||
            attribute.type instanceof mendixmodelsdk_1.domainmodels.FloatAttributeType ||
            attribute.type instanceof mendixmodelsdk_1.domainmodels.IntegerAttributeType ||
            attribute.type instanceof mendixmodelsdk_1.domainmodels.LongAttributeType) {
            return this.createTextBoxForAttribute(attribute);
        }
        else if (attribute.type instanceof mendixmodelsdk_1.domainmodels.DateTimeAttributeType) {
            return this.createDatePickerForAttribute(attribute);
        }
        else {
            throw 'Attribute type not supported: ' + attribute.type;
        }
    }
    createTextBoxForAttribute(attribute) {
        let editable = attribute.type instanceof mendixmodelsdk_1.domainmodels.AutoNumberAttributeType ? mendixmodelsdk_1.pages.EditableEnum.Never : mendixmodelsdk_1.pages.EditableEnum.Always;
        return this.createTextBox(attribute.name + 'TextBox', this.qualifiedNameOfAttribute(attribute), editable);
    }
    createDatePickerForAttribute(attribute) {
        let datePicker = mendixmodelsdk_1.pages.DatePicker.create(this.model());
        datePicker.name = attribute.name + 'DatePicker';
        datePicker.attributePath = this.qualifiedNameOfAttribute(attribute);
        // DM: 157814: [MM] DatePicker missing default attribute values
        datePicker.formattingInfo = mendixmodelsdk_1.pages.FormattingInfo.create(this.model());
        datePicker.onEnterMicroflowSettings = mendixmodelsdk_1.pages.MicroflowSettings.create(this.model());
        datePicker.onChangeMicroflowSettings = mendixmodelsdk_1.pages.MicroflowSettings.create(this.model());
        datePicker.onLeaveMicroflowSettings = mendixmodelsdk_1.pages.MicroflowSettings.create(this.model());
        datePicker.placeholder = this.createText('');
        datePicker.requiredMessage = this.createText('');
        return datePicker;
    }
    createTextBox(name, attributePath, editable) {
        let textBox = mendixmodelsdk_1.pages.TextBox.create(this.model());
        textBox.name = name;
        textBox.attributePath = attributePath;
        textBox.editable = editable;
        // DM: 157613: [MM] TextBox has several missing default property values
        textBox.formattingInfo = mendixmodelsdk_1.pages.FormattingInfo.create(this.model()); // Required
        textBox.onEnterMicroflowSettings = mendixmodelsdk_1.pages.MicroflowSettings.create(this.model()); // Required
        textBox.onChangeMicroflowSettings = mendixmodelsdk_1.pages.MicroflowSettings.create(this.model()); // Required
        textBox.onLeaveMicroflowSettings = mendixmodelsdk_1.pages.MicroflowSettings.create(this.model()); // Required
        textBox.placeholder = this.createText(''); // Required
        textBox.requiredMessage = this.createText(''); // Required
        return textBox;
    }
    createTable(name) {
        let table = mendixmodelsdk_1.pages.Table.create(this.model());
        table.name = name;
        return table;
    }
    createTableColumn(table, width) {
        let column = mendixmodelsdk_1.pages.TableColumn.createIn(table);
        column.width = width;
        return column;
    }
    addTableRows(table, n) {
        for (var i = 0; i < n; i++) {
            mendixmodelsdk_1.pages.TableRow.createIn(table);
        }
    }
    createTableCell(table, topRowIndex, leftColumnIndex, width, height, widget) {
        let cell = mendixmodelsdk_1.pages.TableCell.createIn(table);
        cell.leftColumnIndex = leftColumnIndex;
        cell.topRowIndex = topRowIndex;
        cell.width = width;
        cell.height = height;
        cell.widget = widget;
        return cell;
    }
    createLabelForAttribute(attribute) {
        return this.createLabel(attribute.name + 'Label', this.createText(attribute.name));
    }
    createLabel(name, caption) {
        let label = mendixmodelsdk_1.pages.Label.create(this.model());
        label.name = name;
        label.caption = caption;
        return label;
    }
    qualifiedNameOfAttribute(attribute) {
        // NOW: attribute.qualifiedName === moduleName + '.' attributeName --> BUG
        // WM feedback: 157656 - domainmodels.Attribute.qualifiedName is broken
        // Workaround
        let moduleName = attribute.containerAsEntity.containerAsDomainModel.containerAsModule.name;
        let entityName = attribute.containerAsEntity.name;
        let attributeName = attribute.name;
        let qualifiedName = moduleName + '.' + entityName + '.' + attributeName;
        return qualifiedName;
    }
    /*
     *
     * NAVIGATION
     *
     */
    updateNavigation(project, module, targetPage, callback) {
        let navDoc = project.allNavigationDocuments()[0];
        navDoc.load(navdoc => {
            navdoc.desktopProfile.homePage = mendixmodelsdk_1.navigation.HomePage.create(this.model());
            navdoc.desktopProfile.homePage.page = targetPage;
            callback && callback(project);
        });
    }
    /*
     *
     * MICROFLOWS
     *
     */
    createMicroflow(module, name) {
        let microflow = mendixmodelsdk_1.microflows.Microflow.createIn(module);
        microflow.name = name;
        microflow.objectCollection = mendixmodelsdk_1.microflows.MicroflowObjectCollection.create(this.model());
        microflow.concurrencyErrorMessage = this.createText('');
        return microflow;
    }
    createParameter(name, type, documentation = '') {
        let parameter = mendixmodelsdk_1.microflows.MicroflowParameterObject.create(this.model());
        parameter.name = name;
        parameter.type = type;
        parameter.documentation = documentation;
        return parameter;
    }
    createStartEvent() {
        return mendixmodelsdk_1.microflows.StartEvent.create(this.model());
    }
    createEndEvent(microflow, returnType, returnValue) {
        let endEvent = mendixmodelsdk_1.microflows.EndEvent.create(this.model());
        microflow.returnType = returnType;
        endEvent.returnValue = returnValue;
        return endEvent;
    }
    createRetrieveByAssociationActivity(startVariableName, association) {
        let assocSource = mendixmodelsdk_1.microflows.AssociationRetrieveSource.create(this.model());
        assocSource.startVariableName = startVariableName;
        assocSource.association = association;
        let retrieveAction = mendixmodelsdk_1.microflows.RetrieveAction.create(this.model());
        retrieveAction.retrieveSource = assocSource;
        retrieveAction.outputVariableName = association.parent.name + "Output";
        let retrieveActionActivity = mendixmodelsdk_1.microflows.ActionActivity.create(this.model());
        retrieveActionActivity.action = retrieveAction;
        return retrieveActionActivity;
    }
    addObjectToMicroflow(microflow, objectCollection, obj, drawFlowFrom, flowDirectionHorizontal = true) {
        objectCollection.objects.push(obj);
        if (obj instanceof mendixmodelsdk_1.microflows.MicroflowParameterObject) {
            obj.relativeMiddlePoint = { x: 0, y: -200 }; // No support for multiple parameters yet	
        }
        else {
            if (drawFlowFrom != null) {
                let flow = mendixmodelsdk_1.microflows.SequenceFlow.createIn(microflow);
                flow.caseValue = mendixmodelsdk_1.microflows.NoCase.create(this.model());
                flow.origin = drawFlowFrom;
                flow.destination = obj;
                if (flowDirectionHorizontal) {
                    flow.originConnectionIndex = 1;
                    flow.destinationConnectionIndex = 3;
                    obj.relativeMiddlePoint = { x: drawFlowFrom.relativeMiddlePoint.x + 200, y: drawFlowFrom.relativeMiddlePoint.y };
                }
                else {
                    flow.originConnectionIndex = 2;
                    flow.destinationConnectionIndex = 0;
                    obj.relativeMiddlePoint = { x: drawFlowFrom.relativeMiddlePoint.x, y: drawFlowFrom.relativeMiddlePoint.y + 100 };
                }
            }
            else {
                obj.relativeMiddlePoint = { x: 0, y: 0 };
            }
        }
        return obj;
    }
    /*
     *
     * TEXTS
     *
     */
    createText(text, languageCode) {
        const newText = mendixmodelsdk_1.texts.Text.create(this.model());
        const existingTranslation = newText.translations.find(t => t.languageCode === (languageCode ? languageCode : 'en_US'));
        if (existingTranslation) {
            existingTranslation.text = text;
        }
        else {
            const translation = this.createTranslation(text, languageCode);
            newText.translations.push(translation);
        }
        return newText;
    }
    createTranslation(text, languageCode) {
        let translation = mendixmodelsdk_1.texts.Translation.create(this.model());
        translation.text = text;
        if (languageCode) {
            translation.languageCode = languageCode;
        }
        else {
            translation.languageCode = 'en_US';
        }
        return translation;
    }
}

