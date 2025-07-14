import React, { createContext, useContext, useReducer } from 'react';

/**
 * The initial state for our FGD schema. This is the default structure
 * when the application loads or when a new file is created.
 */
const initialState = {
    metadata: {
        mapsize: { min: -4096, max: 4096 },
        includes: [],
    },
    entities: [],
    // We'll also track which entity is currently selected in the UI
    selectedEntityId: null,
};

/**
 * The reducer function is the heart of our state management. It's the only
 * place where the state can be changed. It takes the current state and an
 * "action" (an object describing the change) and returns the new state.
 */
const fgdReducer = (state, action) => {
    switch (action.type) {
        case 'LOAD_FGD': {
            const loadedState = action.payload;
            // Ensure all entities and their nested items have unique IDs for the UI
            loadedState.entities.forEach((entity) => {
                if (!entity.id) entity.id = crypto.randomUUID();
                entity.properties.forEach((prop) => {
                    if (!prop.id) prop.id = crypto.randomUUID();
                    if (prop.choices) {
                        prop.choices.forEach((choice) => {
                            if (!choice.id) choice.id = crypto.randomUUID();
                        });
                    }
                    if (prop.flags) {
                        prop.flags.forEach((flag) => {
                            if (!flag.id) flag.id = crypto.randomUUID();
                        });
                    }
                });
            });
            return {
                ...loadedState,
                selectedEntityId: loadedState.entities?.[0]?.id || null,
            };
        }

        case 'SELECT_ENTITY':
            return {
                ...state,
                selectedEntityId: action.payload.id,
            };

        case 'ADD_ENTITY':
            const newEntity = {
                id: crypto.randomUUID(),
                classType: 'PointClass',
                name: 'new_entity',
                description: '',
                baseClasses: [],
                helpers: {},
                properties: [],
            };
            return {
                ...state,
                entities: [...state.entities, newEntity],
                selectedEntityId: newEntity.id, // Auto-select the new entity
            };

        case 'UPDATE_ENTITY': {
            const { entityId, updates } = action.payload;
            return {
                ...state,
                entities: state.entities.map(entity =>
                    entity.id === entityId ? { ...entity, ...updates } : entity
                ),
            };
        }

        case 'DELETE_ENTITY': {
            const { entityId } = action.payload;
            const remainingEntities = state.entities.filter(e => e.id !== entityId);
            return {
                ...state,
                entities: remainingEntities,
                // If the deleted entity was selected, deselect it
                selectedEntityId: state.selectedEntityId === entityId ? null : state.selectedEntityId,
            };
        }

        case 'ADD_PROPERTY': {
            const { entityId } = action.payload;
            const newProperty = {
                id: crypto.randomUUID(),
                name: 'new_property',
                type: 'string',
                displayName: '',
                defaultValue: '',
                description: '',
            };
            return {
                ...state,
                entities: state.entities.map(entity =>
                    entity.id === entityId
                        ? { ...entity, properties: [...entity.properties, newProperty] }
                        : entity
                ),
            };
        }

        case 'REORDER_ENTITIES': {
            const { sourceIndex, destinationIndex } = action.payload;
            const reorderedEntities = Array.from(state.entities);
            const [movedItem] = reorderedEntities.splice(sourceIndex, 1);
            reorderedEntities.splice(destinationIndex, 0, movedItem);

            return {
                ...state,
                entities: reorderedEntities,
            };
        }

        case 'UPDATE_PROPERTY': {
            const { entityId, propertyId, updates } = action.payload;
            return {
                ...state,
                entities: state.entities.map(entity =>
                    entity.id === entityId
                        ? {
                              ...entity,
                              properties: entity.properties.map(prop =>
                                  prop.id === propertyId ? { ...prop, ...updates } : prop
                              ),
                          }
                        : entity
                ),
            };
        }

        case 'CHANGE_PROPERTY_TYPE': {
            const { entityId, propertyId, newType } = action.payload;
            return {
                ...state,
                entities: state.entities.map(entity => {
                    if (entity.id !== entityId) return entity;

                    return {
                        ...entity,
                        properties: entity.properties.map(prop => {
                            if (prop.id !== propertyId) return prop;

                            // Create a new property object, preserving common fields
                            const newProperty = {
                                id: prop.id,
                                name: prop.name,
                                displayName: prop.displayName,
                                description: prop.description,
                                type: newType,
                                defaultValue: '', // Reset default value
                            };

                            if (newType === 'choices') newProperty.choices = [];
                            if (newType === 'flags') newProperty.flags = [];

                            return newProperty;
                        }),
                    };
                }),
            };
        }

        case 'ADD_CHOICE': {
            const { entityId, propertyId } = action.payload;
            const newChoice = {
                id: crypto.randomUUID(),
                value: '',
                displayName: '',
            };
            return {
                ...state,
                entities: state.entities.map(entity => {
                    if (entity.id !== entityId) return entity;
                    return {
                        ...entity,
                        properties: entity.properties.map(prop => {
                            if (prop.id !== propertyId || prop.type !== 'choices') return prop;
                            return {
                                ...prop,
                                choices: [...(prop.choices || []), newChoice],
                            };
                        }),
                    };
                }),
            };
        }

        case 'UPDATE_CHOICE': {
            const { entityId, propertyId, choiceId, updates } = action.payload;
            return {
                ...state,
                entities: state.entities.map(entity => {
                    if (entity.id !== entityId) return entity;
                    return {
                        ...entity,
                        properties: entity.properties.map(prop => {
                            if (prop.id !== propertyId || prop.type !== 'choices') return prop;
                            return {
                                ...prop,
                                choices: prop.choices.map(choice =>
                                    choice.id === choiceId ? { ...choice, ...updates } : choice
                                ),
                            };
                        }),
                    };
                }),
            };
        }

        case 'DELETE_CHOICE': {
            const { entityId, propertyId, choiceId } = action.payload;
            return {
                ...state,
                entities: state.entities.map(entity => {
                    if (entity.id !== entityId) return entity;
                    return {
                        ...entity,
                        properties: entity.properties.map(prop => {
                            if (prop.id !== propertyId || prop.type !== 'choices') return prop;
                            return {
                                ...prop,
                                choices: prop.choices.filter(choice => choice.id !== choiceId),
                            };
                        }),
                    };
                }),
            };
        }

        case 'DELETE_PROPERTY': {
            const { entityId, propertyId } = action.payload;
            return {
                ...state,
                entities: state.entities.map(entity =>
                    entity.id === entityId
                        ? { ...entity, properties: entity.properties.filter(p => p.id !== propertyId) }
                        : entity
                ),
            };
        }

        case 'RESET_FGD':
            // Resets the entire state back to its initial, empty state.
            return initialState;

        default:
            return state;
    }
};

// Create the context object
const FGDContext = createContext();

// Create the Provider component that will wrap our application
export const FGDProvider = ({ children }) => {
    const [state, dispatch] = useReducer(fgdReducer, initialState);

    return (
        <FGDContext.Provider value={{ state, dispatch }}>
            {children}
        </FGDContext.Provider>
    );
};

// Create a custom hook to easily access the context in our components
export const useFGD = () => {
    return useContext(FGDContext);
};