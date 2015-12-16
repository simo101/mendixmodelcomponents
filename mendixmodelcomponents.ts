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


export class MendixModelComponents {
	private _model: IModel;

	constructor(model: IModel) {
		this._model = model;
	}

	model(): IModel {
		return this._model;
	}
	
	/*
 	*
 	* PROJECT STRUCTURE
 	*
 	*/

	createModule(project: projects.IProject, name: string): projects.Module {
		const mxModule = projects.Module.createIn(project);
		mxModule.domainModel = domainmodels.DomainModel.createIn(mxModule);

		mxModule.name = name;

		return mxModule;
	}
	
	/*
 	*
 	* DOMAIN MODEL
 	*
 	*/

	createEntity(domainModel: domainmodels.DomainModel, name: string, xLoc: number, yLoc: number): domainmodels.Entity {
		const entity = domainmodels.Entity.createIn(domainModel);

		entity.name = name;
		entity.location = { x: xLoc, y: yLoc };

		return entity;
	}

	addAutoNumberAttribute(entity: domainmodels.Entity, name: string, defaultValue: string): domainmodels.Attribute {

		const value = domainmodels.StoredValue.create(this.model());
		value.defaultValue = defaultValue;

		const type = domainmodels.AutoNumberAttributeType.create(this.model());

		const attribute = this.createNewUntypedAttribute(entity, name, type, value);

		return attribute;
	}

	addIntegerAttribute(entity: domainmodels.Entity, name: string): domainmodels.Attribute {
		return this.createNewUntypedAttribute(entity, name, domainmodels.IntegerAttributeType.create(this.model()));
	}

	addDateTimeAttribute(entity: domainmodels.Entity, name: string): domainmodels.Attribute {
		return this.createNewUntypedAttribute(entity, name, domainmodels.DateTimeAttributeType.create(this.model()));
	}

	addStringAttribute(entity: domainmodels.Entity, name: string, defaultValue?: string): domainmodels.Attribute {
		const type = domainmodels.StringAttributeType.create(this.model());

		if (defaultValue) {
			const value = domainmodels.StoredValue.create(this.model());
			value.defaultValue = defaultValue;

			return this.createNewUntypedAttribute(entity, name, type, value);
		} else {
			return this.createNewUntypedAttribute(entity, name, type);
		}
	}

	createNewUntypedAttribute(entity: domainmodels.Entity, name: string, type: domainmodels.AttributeType, value?: domainmodels.StoredValue): domainmodels.Attribute {
		const attribute = domainmodels.Attribute.createIn(entity);

		attribute.name = name;
		attribute.type = type;

		if (value) {
			attribute.value = value;
		}

		return attribute;
	}

	associate(domainModel: domainmodels.DomainModel, source: domainmodels.Entity, target: domainmodels.Entity, name: string): domainmodels.Association {
		let association = domainmodels.Association.createIn(domainModel);

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

	createListPageForEntity(entity: domainmodels.Entity, sortAttribute: domainmodels.Attribute, layout: pages.Layout, layoutPlaceholderName: string, editPage: pages.Page): pages.Page {
		let table = this.createTableForEntity(entity);

		let listView = this.createListViewForEntity(entity, sortAttribute);
		listView.widget = table;
		listView.clickAction = this.createPageAction(editPage, 'Edit ' + entity.name);

		let layoutCall = this.createLayoutCall(layout);
		let layoutCallArgument = this.createLayoutCallArgument(layoutCall, layoutPlaceholderName, listView);

		return this.createPage(entity.container.container, entity.name + '_List', entity.name + 's', layoutCall);
	}

	createPageAction(page: pages.Page, pageTitle: string): pages.PageClientAction {
		let action = pages.PageClientAction.create(this.model());

		action.pageSettings = pages.PageSettings.create(this.model());
		action.pageSettings.page = page;
		action.pageSettings.formTitle = this.createText(pageTitle);

		return action;
	}

	createEditPageForEntity(entity: domainmodels.Entity, layout: pages.Layout, layoutPlaceholderName: string): pages.Page {
		let dataview = this.createDataViewForEntity(entity);

		let layoutCall = this.createLayoutCall(layout);
		let layoutCallArgument = this.createLayoutCallArgument(layoutCall, layoutPlaceholderName, dataview);

		return this.createPage(entity.container.container, entity.name + '_Edit', 'Edit ' + entity.name, layoutCall);
	}

	createPage(module: projects.Module, name: string, title: string, layoutCall: pages.LayoutCall): pages.Page {
		let page = pages.Page.createIn(module);

		page.name = name;
		page.title = this.createText(title);
		page.layoutCall = layoutCall;

		return page;
	}

	createPlaceholder(name: string): pages.Placeholder {
		let placeholder = pages.Placeholder.create(this.model());

		placeholder.name = name;

		return placeholder;
	}

	retrieveLayout(project: IModel, qualifiedName: string): when.Promise<pages.Layout> {
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

	createLayout(module: projects.Module, name: string, mainPlaceholder: pages.Widget): pages.Layout {
		// TODO: Setting main placeholder does not work. Using existing layout instead ... :-(

		//let mainPlaceholderParameter = new pages.LayoutParameter();
		//mainPlaceholderParameter.name = mainPlaceholder.name;

		let layout = pages.Layout.createIn(module);

		layout.name = name;
		layout.widget = mainPlaceholder;
		//layout.mainPlaceholder = layout.parameters.filter(p => p.name === mainPlaceholder.name)[0];

		return layout;
	}

	createLayoutCallArgument(layoutCall: pages.LayoutCall, parameterName: string, widget: pages.Widget): pages.LayoutCallArgument {
		let argument = pages.LayoutCallArgument.createIn(layoutCall);

		argument.parameterName = parameterName;
		argument.widget = widget;

		return argument;
	}

	createLayoutCall(layout: pages.ILayout): pages.LayoutCall {
		let layoutCall = pages.LayoutCall.create(this.model());

		layoutCall.layout = layout;

		return layoutCall;
	}

	createListViewForEntity(entity: domainmodels.Entity, sortAttribute: domainmodels.Attribute): pages.ListView {
		let lvSource = this.createListViewSourceForEntity(entity, sortAttribute);
		let listView = this.createListView(entity.name + 'ListView', lvSource);

		return listView;
	}

	createListViewSourceForEntity(entity: domainmodels.Entity, sortAttribute: domainmodels.Attribute): pages.ListViewDatabaseSource {
		// Feedback items on types of data sources:
		// WM: 157790: [MM] ListView.dataSource (& other grid datasources) does not properly restrict assignment to allowed subset of compatible subtypes
		// DM: 157786: [MM] ListView.dataSource (& other grid datasources) does not properly restrict assignment to allowed subset of compatible subtypes

		let listViewSource = pages.ListViewDatabaseSource.create(this.model());

		listViewSource.entityPath = entity.qualifiedName;
		listViewSource.sortBar = pages.GridSortBar.create(this.model()); // WM 157809: ListViewSource.sortBar misses default value

		if (sortAttribute) {
			let sortItem = pages.GridSortItem.createIn(listViewSource.sortBar);

			sortItem.attributePath = this.qualifiedNameOfAttribute(sortAttribute);
		}

		return listViewSource;
	}

	createListView(name: string, dataSource: pages.DataSource): pages.ListView {
		let listView = pages.ListView.create(this.model());

		listView.name = name;
		listView.dataSource = dataSource;

		listView.clickAction = pages.NoClientAction.create(this.model()); // DM: 157812: [MM] ListView.clickAction default is missing

		return listView;
	}

	createDataViewForEntity(entity: domainmodels.Entity): pages.DataView {
		let table = this.createTableForEntity(entity);

		return this.createDataView(entity.name + 'DataView', this.createDataViewSource(entity.qualifiedName), table);
	}

	createTableForEntity(entity: domainmodels.Entity): pages.Table {
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

	createDataView(name: string, dataSource: pages.DataSource, widget: pages.Widget): pages.DataView {
		let dataView = pages.DataView.create(this.model());

		dataView.name = name;
		dataView.dataSource = dataSource;
		dataView.widget = widget;

		// DM: 157291: [MM] Default values DataViewSource for DV.dataSource & DataViewControlBar for DV.controlBar missing
		dataView.controlBar = pages.DataViewControlBar.create(this.model());

		dataView.noEntityMessage = this.createText('');

		return dataView;
	}

	createDataViewSource(entityPath: string): pages.DataViewSource {
		let dvSource = pages.DataViewSource.create(this.model());

		dvSource.entityPath = entityPath;

		return dvSource;
	}

	createInputForAttribute(attribute: domainmodels.Attribute): pages.Widget {
		if (attribute.type instanceof domainmodels.StringAttributeType ||
			attribute.type instanceof domainmodels.AutoNumberAttributeType ||
			attribute.type instanceof domainmodels.CurrencyAttributeType ||
			attribute.type instanceof domainmodels.DecimalAttributeType ||
			attribute.type instanceof domainmodels.FloatAttributeType ||
			attribute.type instanceof domainmodels.IntegerAttributeType ||
			attribute.type instanceof domainmodels.LongAttributeType) {

			return this.createTextBoxForAttribute(attribute);
		} else if (attribute.type instanceof domainmodels.DateTimeAttributeType) {
			return this.createDatePickerForAttribute(attribute);
		} else {
			throw 'Attribute type not supported: ' + attribute.type.qualifiedName;
		}
	}

	createTextBoxForAttribute(attribute: domainmodels.Attribute): pages.TextBox {
		let editable = attribute.type instanceof domainmodels.AutoNumberAttributeType ? pages.EditableEnum.Never : pages.EditableEnum.Always;

		return this.createTextBox(attribute.name + 'TextBox', this.qualifiedNameOfAttribute(attribute), editable);
	}

	createDatePickerForAttribute(attribute: domainmodels.Attribute): pages.DatePicker {
		let datePicker = pages.DatePicker.create(this.model());
		datePicker.name = attribute.name + 'DatePicker';

		datePicker.attributePath = this.qualifiedNameOfAttribute(attribute);

		// DM: 157814: [MM] DatePicker missing default attribute values
		datePicker.formattingInfo = pages.FormattingInfo.create(this.model());
		datePicker.onEnterMicroflowSettings = pages.MicroflowSettings.create(this.model());
		datePicker.onChangeMicroflowSettings = pages.MicroflowSettings.create(this.model());
		datePicker.onLeaveMicroflowSettings = pages.MicroflowSettings.create(this.model());

		datePicker.placeholder = this.createText('');
		datePicker.requiredMessage = this.createText('');

		return datePicker;
	}

	createTextBox(name: string, attributePath: string, editable: pages.EditableEnum): pages.TextBox {
		let textBox = pages.TextBox.create(this.model());

		textBox.name = name;
		textBox.attributePath = attributePath;
		textBox.editable = editable;

		// DM: 157613: [MM] TextBox has several missing default property values
		textBox.formattingInfo = pages.FormattingInfo.create(this.model()); // Required
		textBox.onEnterMicroflowSettings = pages.MicroflowSettings.create(this.model()); // Required
		textBox.onChangeMicroflowSettings = pages.MicroflowSettings.create(this.model()); // Required
		textBox.onLeaveMicroflowSettings = pages.MicroflowSettings.create(this.model()); // Required
		textBox.placeholder = this.createText(''); // Required
		textBox.requiredMessage = this.createText(''); // Required

		return textBox;
	}

	createTable(name: string): pages.Table {
		let table = pages.Table.create(this.model());

		table.name = name;

		return table;
	}

	createTableColumn(table: pages.Table, width: number): pages.TableColumn {
		let column = pages.TableColumn.createIn(table);

		column.width = width;

		return column;
	}

	addTableRows(table: pages.Table, n: number): void {
		for (var i = 0; i < n; i++) {
			pages.TableRow.createIn(table);
		}
	}

	createTableCell(table: pages.Table, topRowIndex: number, leftColumnIndex: number, width: number, height: number, widget: pages.Widget): pages.TableCell {
		let cell = pages.TableCell.createIn(table);

		cell.leftColumnIndex = leftColumnIndex;
		cell.topRowIndex = topRowIndex;
		cell.width = width;
		cell.height = height;

		cell.widget = widget;

		return cell;
	}

	createLabelForAttribute(attribute: domainmodels.Attribute): pages.Label {
		return this.createLabel(attribute.name + 'Label', this.createText(attribute.name));
	}

	createLabel(name: string, caption: texts.Text): pages.Label {
		let label = pages.Label.create(this.model());

		label.name = name;
		label.caption = caption;

		return label;
	}

	qualifiedNameOfAttribute(attribute: domainmodels.Attribute): string {
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

	updateNavigation(project: IModel, module: projects.Module, targetPage: pages.Page, callback: (project: IModel) => void): void {
		let navDoc = project.allNavigationDocuments()[0];

		navDoc.load(navdoc => {
			navdoc.desktopProfile.homePage = navigation.HomePage.create(this.model());
			navdoc.desktopProfile.homePage.page = targetPage;

			callback && callback(project);
		});
	}

	/*
	 *
	 * MICROFLOWS
	 *
	 */

	createMicroflow(module: projects.IModule, name: string): microflows.Microflow {
		let microflow = microflows.Microflow.createIn(module);
		microflow.name = name;

		microflow.objectCollection = microflows.MicroflowObjectCollection.create(this.model());
		microflow.concurrencyErrorMessage = this.createText('');

		return microflow;
	}

	createParameter(name: string, type: string, documentation: string = ''): microflows.MicroflowParameterObject {
		let parameter = microflows.MicroflowParameterObject.create(this.model());

		parameter.name = name;
		parameter.type = type;
		parameter.documentation = documentation;

		return parameter;
	}

	createStartEvent(): microflows.StartEvent {
		return microflows.StartEvent.create(this.model());
	}

	createEndEvent(microflow: microflows.Microflow, returnType: string, returnValue: string): microflows.EndEvent {
		let endEvent = microflows.EndEvent.create(this.model());

		microflow.returnType = returnType;
		endEvent.returnValue = returnValue;

		return endEvent;
	}

	createRetrieveByAssociationActivity(startVariableName: string, association: domainmodels.IAssociation): microflows.ActionActivity {
		let assocSource = microflows.AssociationRetrieveSource.create(this.model());
		assocSource.startVariableName = startVariableName;
		assocSource.association = association;

		let retrieveAction = microflows.RetrieveAction.create(this.model());
		retrieveAction.retrieveSource = assocSource;
		retrieveAction.outputVariableName = association.parent.name + "Output";

		let retrieveActionActivity = microflows.ActionActivity.create(this.model());
		retrieveActionActivity.action = retrieveAction;
		return retrieveActionActivity;
	}

	addObjectToMicroflow(microflow: microflows.Microflow, objectCollection: microflows.MicroflowObjectCollection, obj: microflows.MicroflowObject, drawFlowFrom: microflows.MicroflowObject, flowDirectionHorizontal: boolean = true): microflows.MicroflowObject {
		objectCollection.objects.push(obj);
		if (obj instanceof microflows.MicroflowParameterObject) {
			obj.relativeMiddlePoint = { x: 0, y: -200 }; // No support for multiple parameters yet	
		} else {
			if (drawFlowFrom != null) {
				let flow = microflows.SequenceFlow.createIn(microflow);
				flow.caseValue = microflows.NoCase.create(this.model());
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

	createText(text: string, languageCode?: string) {
		const newText = texts.Text.create(this.model());

		const existingTranslation = newText.translations.find(t => t.languageCode === (languageCode ? languageCode : 'en_US'));
		if (existingTranslation) {
			existingTranslation.text = text;
		} else {
			const translation = this.createTranslation(text, languageCode);
			newText.translations.push(translation);
		}

		return newText;
	}

	createTranslation(text: string, languageCode?: string): texts.Translation {
		let translation = texts.Translation.create(this.model());

		translation.text = text;

		if (languageCode) {
			translation.languageCode = languageCode;
		} else {
			translation.languageCode = 'en_US';
		}

		return translation;
	}
}
