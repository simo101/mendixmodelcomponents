/*
The MIT License (MIT)

Copyright (c) 2015 Mendix

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

///<reference path="typings/tsd.d.ts" />

import {IModel, projects, domainmodels, pages, microflows, navigation, texts} from "mendixmodelsdk"

import when = require('when');

/*
 *
 * PROJECT STRUCTURE
 *
 */

export function createModule(project: projects.IProject, name: string): projects.Module {
	const mxModule = new projects.Module(project);
	mxModule.domainModel = new domainmodels.DomainModel(mxModule);

	mxModule.name = name;

	return mxModule;
}

/*
 *
 * DOMAIN MODEL
 *
 */

export function createEntity(domainModel: domainmodels.DomainModel, name: string, xLoc: number, yLoc: number): domainmodels.Entity {
	const entity = new domainmodels.Entity();

	entity.name = name;
	entity.location = { x: xLoc, y: yLoc };

	domainModel.entities.push(entity);

	return entity;
}

export function addAutoNumberAttribute(entity: domainmodels.Entity, name: string, defaultValue: string): domainmodels.Attribute {
	const value = new domainmodels.StoredValue();
	value.defaultValue = defaultValue;

	const attribute = createNewUntypedAttribute(entity, name, new domainmodels.AutoNumberAttributeType(), value);

	return attribute;
}

export function addIntegerAttribute(entity: domainmodels.Entity, name: string): domainmodels.Attribute {
	return createNewUntypedAttribute(entity, name, new domainmodels.IntegerAttributeType());
}

export function addDateTimeAttribute(entity: domainmodels.Entity, name: string): domainmodels.Attribute {
	return createNewUntypedAttribute(entity, name, new domainmodels.DateTimeAttributeType());
}

export function addStringAttribute(entity: domainmodels.Entity, name: string, defaultValue?: string): domainmodels.Attribute {
	const type = new domainmodels.StringAttributeType();

	if (defaultValue) {
		const value = new domainmodels.StoredValue();
		value.defaultValue = defaultValue;

		return createNewUntypedAttribute(entity, name, type, value);
	} else {
		return createNewUntypedAttribute(entity, name, type);
	}
}

export function createNewUntypedAttribute(entity: domainmodels.Entity, name: string, type: domainmodels.AttributeType, value?: domainmodels.StoredValue): domainmodels.Attribute {
	const attribute = new domainmodels.Attribute();

	attribute.name = name;
	attribute.type = type;

	if (value) {
		attribute.value = value;
	}

	entity.attributes.push(attribute);

	return attribute;
}

export function associate(domainModel: domainmodels.DomainModel, source: domainmodels.Entity, target: domainmodels.Entity, name: string): domainmodels.Association {
	let association = new domainmodels.Association();

	association.parent = source;
	association.child = target;
	association.name = name;

	association.parentConnection = { "x": 0, "y": 30 };
	association.childConnection = { "x": 100, "y": 30 };

	domainModel.associations.push(association);

	return association;
}

/*
 *
 * PAGES
 *
 */

export function createListPageForEntity(entity: domainmodels.Entity, sortAttribute: domainmodels.Attribute, layout: pages.Layout, layoutPlaceholderName: string, editPage: pages.Page): void {
	let table = createTableForEntity(entity);

	let listView = createListViewForEntity(entity, sortAttribute);
	listView.widget = table;
	listView.clickAction = createPageAction(editPage, 'Edit ' + entity.name);

	let layoutCall = createLayoutCall(layout);
	let layoutCallArgument = createLayoutCallArgument(layoutCall, layoutPlaceholderName, listView);

	createPage(entity.container.container, entity.name + '_List', entity.name + 's', layoutCall);
}

export function createPageAction(page: pages.Page, pageTitle: string): pages.PageClientAction {
	let action = new pages.PageClientAction();

	action.pageSettings = new pages.PageSettings();
	action.pageSettings.page = page;
	action.pageSettings.formTitle = createText(pageTitle);

	return action;
}

export function createEditPageForEntity(entity: domainmodels.Entity, layout: pages.Layout, layoutPlaceholderName: string): pages.Page {
	let dataview = createDataViewForEntity(entity);

	let layoutCall = createLayoutCall(layout);
	let layoutCallArgument = createLayoutCallArgument(layoutCall, layoutPlaceholderName, dataview);

	return createPage(entity.container.container, entity.name + '_Edit', 'Edit ' + entity.name, layoutCall);
}

export function createPage(module: projects.Module, name: string, title: string, layoutCall: pages.LayoutCall): pages.Page {
	let page = new pages.Page(module);

	page.name = name;
	page.title = createText(title);
	page.layoutCall = layoutCall;

	module.documents.push(page);

	return page;
}

export function createPlaceholder(name: string): pages.Placeholder {
	let placeholder = new pages.Placeholder();

	placeholder.name = name;

	return placeholder;
}

export function retrieveLayout(project: IModel, qualifiedName: string): when.Promise<pages.Layout> {
	return when.promise<pages.Layout>((resolve, reject) => {
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

export function createLayout(module: projects.Module, name: string, mainPlaceholder: pages.Widget): pages.Layout {
	// TODO: Setting main placeholder does not work. Using existing layout instead ... :-(

	//let mainPlaceholderParameter = new pages.LayoutParameter();
	//mainPlaceholderParameter.name = mainPlaceholder.name;

	let layout = new pages.Layout(module);

	layout.name = name;
	layout.widget = mainPlaceholder;
	//layout.mainPlaceholder = layout.parameters.filter(p => p.name === mainPlaceholder.name)[0];

	return layout;
}

export function createLayoutCallArgument(layoutCall: pages.LayoutCall, parameterName: string, widget: pages.Widget): pages.LayoutCallArgument {
	let argument = new pages.LayoutCallArgument();

	argument.parameterName = parameterName;
	argument.widget = widget;

	layoutCall.arguments.push(argument);

	return argument;
}

export function createLayoutCall(layout: pages.ILayout): pages.LayoutCall {
	let layoutCall = new pages.LayoutCall();

	layoutCall.layout = layout;

	return layoutCall;
}

export function createListViewForEntity(entity: domainmodels.Entity, sortAttribute: domainmodels.Attribute): pages.ListView {
	let lvSource = createListViewSourceForEntity(entity, sortAttribute);
	let listView = createListView(entity.name + 'ListView', lvSource);

	return listView;
}

export function createListViewSourceForEntity(entity: domainmodels.Entity, sortAttribute: domainmodels.Attribute): pages.ListViewDatabaseSource {
	// Feedback items on types of data sources:
	// WM: 157790: [MM] ListView.dataSource (& other grid datasources) does not properly restrict assignment to allowed subset of compatible subtypes
	// DM: 157786: [MM] ListView.dataSource (& other grid datasources) does not properly restrict assignment to allowed subset of compatible subtypes

	let listViewSource = new pages.ListViewDatabaseSource();

	listViewSource.entityPath = entity.qualifiedName;
	listViewSource.sortBar = new pages.GridSortBar(); // WM 157809: ListViewSource.sortBar misses default value

	if (sortAttribute) {
		let sortItem = new pages.GridSortItem();

		sortItem.attributePath = qualifiedNameOfAttribute(sortAttribute);

		listViewSource.sortBar.sortItems.push(sortItem);
	}

	return listViewSource;
}

export function createListView(name: string, dataSource: pages.DataSource): pages.ListView {
	let listView = new pages.ListView();

	listView.name = name;
	listView.dataSource = dataSource;

	listView.clickAction = new pages.NoClientAction(); // DM: 157812: [MM] ListView.clickAction default is missing

	return listView;
}

export function createDataViewForEntity(entity: domainmodels.Entity): pages.DataView {
	let table = createTableForEntity(entity);

	return createDataView(entity.name + 'DataView', createDataViewSource(entity.qualifiedName), table);
}

export function createTableForEntity(entity: domainmodels.Entity): pages.Table {
	let table = createTable(entity.name + 'Table');

	createTableColumn(table, 25);
	createTableColumn(table, 75);

	addTableRows(table, entity.attributes.length);

	for (var row = 0; row < entity.attributes.length; row++) {
		let attribute = entity.attributes[row];

		let cell = createTableCell(table, row, 0, 1, 1, createLabelForAttribute(attribute));

		createTableCell(table, row, 1, 1, 1, createInputForAttribute(attribute));
	}

	return table;
}

export function createDataView(name: string, dataSource: pages.DataSource, widget: pages.Widget): pages.DataView {
	let dataView = new pages.DataView();

	dataView.name = name;
	dataView.dataSource = dataSource;
	dataView.widget = widget;

	// DM: 157291: [MM] Default values DataViewSource for DV.dataSource & DataViewControlBar for DV.controlBar missing
	dataView.controlBar = new pages.DataViewControlBar();

	dataView.noEntityMessage = createText('');

	return dataView;
}

export function createDataViewSource(entityPath: string): pages.DataViewSource {
	let dvSource = new pages.DataViewSource();

	dvSource.entityPath = entityPath;

	return dvSource;
}

export function createInputForAttribute(attribute: domainmodels.Attribute): pages.Widget {
	if (attribute.type instanceof domainmodels.StringAttributeType ||
		attribute.type instanceof domainmodels.AutoNumberAttributeType ||
		attribute.type instanceof domainmodels.CurrencyAttributeType ||
		attribute.type instanceof domainmodels.DecimalAttributeType ||
		attribute.type instanceof domainmodels.FloatAttributeType ||
		attribute.type instanceof domainmodels.IntegerAttributeType ||
		attribute.type instanceof domainmodels.LongAttributeType) {

		return createTextBoxForAttribute(attribute);
	} else if (attribute.type instanceof domainmodels.DateTimeAttributeType) {
		return createDatePickerForAttribute(attribute);
	} else {
		throw 'Attribute type not supported: ' + attribute.type.qualifiedName;
	}
}

export function createTextBoxForAttribute(attribute: domainmodels.Attribute): pages.TextBox {
	let editable = attribute.type instanceof domainmodels.AutoNumberAttributeType ? pages.EditableEnum.Never : pages.EditableEnum.Always;

	return createTextBox(attribute.name + 'TextBox', qualifiedNameOfAttribute(attribute), editable);
}

export function createDatePickerForAttribute(attribute: domainmodels.Attribute): pages.DatePicker {
	let datePicker = new pages.DatePicker();
	datePicker.name = attribute.name + 'DatePicker';

	datePicker.attributePath = qualifiedNameOfAttribute(attribute);

	// DM: 157814: [MM] DatePicker missing default attribute values
	datePicker.formattingInfo = new pages.FormattingInfo();
	datePicker.onEnterMicroflowSettings = new pages.MicroflowSettings();
	datePicker.onChangeMicroflowSettings = new pages.MicroflowSettings();
	datePicker.onLeaveMicroflowSettings = new pages.MicroflowSettings();

	datePicker.placeholder = createText('');
	datePicker.requiredMessage = createText('');

	return datePicker;
}

export function createTextBox(name: string, attributePath: string, editable: pages.EditableEnum): pages.TextBox {
	let textBox = new pages.TextBox();

	textBox.name = name;
	textBox.attributePath = attributePath;
	textBox.editable = editable;

	// DM: 157613: [MM] TextBox has several missing default property values
	textBox.formattingInfo = new pages.FormattingInfo(); // Required
	textBox.onEnterMicroflowSettings = new pages.MicroflowSettings(); // Required
	textBox.onChangeMicroflowSettings = new pages.MicroflowSettings(); // Required
	textBox.onLeaveMicroflowSettings = new pages.MicroflowSettings(); // Required
	textBox.placeholder = createText(''); // Required
	textBox.requiredMessage = createText(''); // Required

	return textBox;
}

export function createTable(name: string): pages.Table {
	let table = new pages.Table();

	table.name = name;

	return table;
}

export function createTableColumn(table: pages.Table, width: number): pages.TableColumn {
	let column = new pages.TableColumn();

	column.width = width;

	table.columns.push(column);

	return column;
}

export function addTableRows(table: pages.Table, n: number): void {
	for (var i = 0; i < n; i++) {
		table.rows.push(new pages.TableRow());
	}
}

export function createTableCell(table: pages.Table, topRowIndex: number, leftColumnIndex: number, width: number, height: number, widget: pages.Widget): pages.TableCell {
	let cell = new pages.TableCell();

	cell.leftColumnIndex = leftColumnIndex;
	cell.topRowIndex = topRowIndex;
	cell.width = width;
	cell.height = height;

	cell.widget = widget;

	table.cells.push(cell);

	return cell;
}

export function createLabelForAttribute(attribute: domainmodels.Attribute): pages.Label {
	return createLabel(attribute.name + 'Label', createText(attribute.name));
}

export function createLabel(name: string, caption: texts.Text): pages.Label {
	let label = new pages.Label();

	label.name = name;
	label.caption = caption;

	return label;
}

export function qualifiedNameOfAttribute(attribute: domainmodels.Attribute): string {
	// NOW: attribute.qualifiedName === moduleName + '.' attributeName --> BUG
	// WM feedback: 157656 - domainmodels.Attribute.qualifiedName is broken

	// Workaround

	let moduleName = attribute.container.container.moduleName;
	let entityName = attribute.container.name;
	let attributeName = attribute.name;

	let qualifiedName = moduleName + '.' + entityName + '.' + attributeName;

	return qualifiedName;
}

/*
 *
 * NAVIGATION
 *
 */

export function updateNavigation(project: IModel, module: projects.Module, targetPage: pages.Page, callback: (project: IModel) => void): void {
	let navDoc = project.allNavigationDocuments()[0];

	navDoc.load(navdoc => {
		navdoc.desktopProfile.homePage = new navigation.HomePage();
		navdoc.desktopProfile.homePage.page = targetPage;

		callback && callback(project);
	});
}

/*
 *
 * MICROFLOWS
 *
 */

export function createMicroflow(module: projects.IModule, name: string): microflows.Microflow {
	let microflow = new microflows.Microflow(module);
	microflow.name = name;

	microflow.objectCollection = new microflows.MicroflowObjectCollection();
	microflow.concurrenyErrorMessage = createText('');

	return microflow;
}

export function createParameter(name: string, type: string, documentation: string = ''): microflows.MicroflowParameterObject {
	let parameter = new microflows.MicroflowParameterObject();

	parameter.name = name;
	parameter.type = type;
	parameter.documentation = documentation;

	return parameter;
}

export function createStartEvent(): microflows.StartEvent {
	return new microflows.StartEvent();
}

export function createEndEvent(microflow: microflows.Microflow, returnType: string, returnValue: string): microflows.EndEvent {
	let endEvent = new microflows.EndEvent();

	microflow.returnType = returnType;
	endEvent.returnValue = returnValue;

	return endEvent;
}

export function createRetrieveByAssociationActivity(startVariableName: string, association: domainmodels.IAssociation): microflows.ActionActivity {
	let assocSource = new microflows.AssociationRetrieveSource();
	assocSource.startVariableName = startVariableName;
	assocSource.association = association;

	let retrieveAction = new microflows.RetrieveAction();
	retrieveAction.retrieveSource = assocSource;
	retrieveAction.outputVariableName = association.parent.name + "Output";

	let retrieveActionActivity = new microflows.ActionActivity();
	retrieveActionActivity.action = retrieveAction;
	return retrieveActionActivity;
}

export function addObjectToMicroflow(microflow: microflows.Microflow, objectCollection: microflows.MicroflowObjectCollection, obj: microflows.MicroflowObject, drawFlowFrom: microflows.MicroflowObject, flowDirectionHorizontal: boolean = true): microflows.MicroflowObject {
	objectCollection.objects.push(obj);
	if (obj instanceof microflows.MicroflowParameterObject) {
		obj.relativeMiddlePoint = { x: 0, y: -200 }; // No support for multiple parameters yet	
	} else {
		if (drawFlowFrom != null) {
			let flow = new microflows.SequenceFlow();
			flow.caseValue = new microflows.NoCase();
			flow.origin = drawFlowFrom;
			flow.destination = obj;
			if (flowDirectionHorizontal) {
				flow.originConnectionIndex = 1;
				flow.destinationConnectionIndex = 3;
				obj.relativeMiddlePoint = { x: drawFlowFrom.relativeMiddlePoint.x + 200, y: drawFlowFrom.relativeMiddlePoint.y };
			} else {
				flow.originConnectionIndex = 2;
				flow.destinationConnectionIndex = 0;
				obj.relativeMiddlePoint = { x: drawFlowFrom.relativeMiddlePoint.x, y: drawFlowFrom.relativeMiddlePoint.y + 100 };
			}
			microflow.flows.push(flow);
		} else {
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

export function createText(text: string, languageCode?: string) {
	const newText = new texts.Text();

	const existingTranslation = newText.translations.find(t => t.languageCode === (languageCode ? languageCode : 'en_US'));
	if (existingTranslation) {
		existingTranslation.text = text;
	} else {
		const translation = createTranslation(text, languageCode);
		newText.translations.push(translation);
	}

	return newText;
}

export function createTranslation(text: string, languageCode?: string): texts.Translation {
	let translation = new texts.Translation();

	translation.text = text;

	if (languageCode) {
		translation.languageCode = languageCode;
	} else {
		translation.languageCode = 'en_US';
	}

	return translation;
}
