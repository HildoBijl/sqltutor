export const contents = {
	databases: {
		fundamentals: {
			definitions: {
				database: {
					type: 'concept',
					name: 'Database',
				},
				databaseTable: {
					type: 'concept',
					name: 'Database table',
					prerequisites: ['database'],
				},
				dataTypes: {
					type: 'concept',
					name: 'Data types',
					prerequisites: ['databaseTable'],
				},
				databaseKeys: {
					type: 'concept',
					name: 'Database keys',
					prerequisites: ['databaseTable'],
				},
			},
			manipulation: {
				projectionAndFiltering: {
					type: 'concept',
					name: 'Projection and filtering',
					prerequisites: ['databaseTable'],
				},
				joinAndDecomposition: {
					type: 'concept',
					name: 'Join and decomposition',
					prerequisites: ['databaseKeys', 'projectionAndFiltering'],
				},
				innerAndOuterJoin: {
					type: 'concept',
					name: 'Inner and outer join',
					prerequisites: ['joinAndDecomposition', 'dataTypes'],
				},
				aggregation: {
					type: 'concept',
					name: 'Aggregation',
					prerequisites: ['dataTypes', 'projectionAndFiltering'],
				},
				pivotTable: {
					type: 'concept',
					name: 'Pivot table',
					prerequisites: ['databaseTable'],
				},
			},
		},
		queryLanguages: {
			queryLanguage: {
				type: 'concept',
				name: 'Query language',
				prerequisites: ['database'],
			},
			sql: {
				sql: {
					type: 'concept',
					name: 'SQL',
					prerequisites: ['queryLanguage'],
				},
				reading: {
					fundamentals: {
						filtering: {
							filterRows: {
								type: 'skill',
								name: 'Filter rows',
								prerequisites: ['sql', 'projectionAndFiltering', 'dataTypes'],
							},
							filterRowsOnMultipleCriteria: {
								type: 'skill',
								name: 'Filter rows on multiple criteria',
								prerequisites: ['filterRows'],
							},
						},
						projection: {
							chooseColumns: {
								type: 'skill',
								name: 'Choose columns',
								prerequisites: ['sql', 'projectionAndFiltering'],
							},
							createProcessedColumns: {
								type: 'skill',
								name: 'Create processed columns',
								prerequisites: ['dataTypes', 'chooseColumns'],
							},
						},
						sorting: {
							sortRows: {
								type: 'skill',
								name: 'Sort rows',
								prerequisites: ['sql', 'dataTypes'],
							},
						},
					},
					singleTableQueries: {
						writeSingleCriterionQuery: {
							type: 'skill',
							name: 'Write single-criterion query',
							prerequisites: ['chooseColumns', 'filterRows'],
						},
						writeMultiCriterionQuery: {
							type: 'skill',
							name: 'Write multi-criterion query',
							prerequisites: ['createProcessedColumns', 'filterRowsOnMultipleCriteria', 'sortRows'],
						},
					},
					multiTableQueries: {
						joinTables: {
							type: 'skill',
							name: 'Join tables',
							prerequisites: ['innerAndOuterJoin', 'chooseColumns', 'filterRowsOnMultipleCriteria'],
						},
						writeMultiTableQuery: {
							type: 'skill',
							name: 'Write multi-table query',
							prerequisites: ['joinTables', 'writeSingleCriterionQuery'],
						},
						writeMultiLayeredQuery: {
							type: 'skill',
							name: 'Write multi-layered query',
							prerequisites: ['useFilteredAggregation', 'writeMultiCriterionQuery', 'writeMultiTableQuery'],
						},
					},
					aggregation: {
						aggregateColumns: {
							type: 'skill',
							name: 'Aggregate columns',
							prerequisites: ['aggregation', 'chooseColumns'],
						},
						useFilteredAggregation: {
							type: 'skill',
							name: 'Use filtered aggregation',
							prerequisites: ['aggregateColumns', 'filterRowsOnMultipleCriteria', 'createProcessedColumns'],
						},
						useDynamicAggregation: {
							type: 'skill',
							name: 'Use dynamic aggregation',
							prerequisites: ['aggregateColumns'],
						},
						createPivotTable: {
							type: 'skill',
							name: 'Create pivot table',
							prerequisites: ['pivotTable', 'writeSingleCriterionQuery', 'aggregateColumns'],
						},
					},
				},
			},
		},
	},
}

// Set up extra parameters that will be filled up.
export const components = {}, concepts = {}, skills = {}

// First preprocess the whole skill tree, preparing all objects for further processing.
const preprocessComponent = (component, id, path = []) => {
	// Run some basic processing for each component.
	component.id = id
	component.path = path
	if (!component.prerequisites)
		component.prerequisites = []
	component.followUps = []

	// Store the component in various reference lists.
	components[id] = component
	if (component.type === 'concept')
		concepts[id] = component
	if (component.type === 'skill')
		skills[id] = component

	// Return the result if needed.
	return component
}
const preprocessFolder = (folder, id, path = []) => {
	// If it's a component (it has a type) then process it as specified.
	if (folder.type)
		return preprocessComponent(folder, id, path)

	// It's a folder. Process all the folder contents.
	Object.keys(folder).forEach(id => preprocessFolder(folder[id], id, [...path, id]))

	// Return the result if needed.
	return folder
}
preprocessFolder(contents)

// Run through all components again for more advanced processing.
Object.values(components).forEach(component => {
	// Register all prerequisites as follow-up at the corresponding prerequisite. Also apply object referencing instead of ID referencing.
	component.prerequisites = component.prerequisites.map(prerequisiteId => {
		const prerequisite = components[prerequisiteId]
		if (!prerequisite)
			throw new Error(`Invalid skill tree: component ${component.id} has an unknown prerequisite "${prerequisiteId}".`)
		prerequisite.followUps.push(component)
		return prerequisite
	})
})
