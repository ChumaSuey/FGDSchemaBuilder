import React from 'react';
import { useFGD } from '../context/FGDContext';

const PROPERTY_TYPES = ['string', 'integer', 'float', 'boolean', 'choices', 'flags', 'custom'];

export const PropertyEditor = ({ entityId, property }) => {
    const { dispatch } = useFGD();

    // Generic handler to update any field on the property
    const handleUpdate = (updates) => {
        dispatch({
            type: 'UPDATE_PROPERTY',
            payload: { entityId, propertyId: property.id, updates },
        });
    };

    // Handler for changing the property's type. This is a destructive action.
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        if (window.confirm(`Change type to "${newType}"? This will reset property-specific values like choices, flags, and the default value.`)) {
            dispatch({
                type: 'CHANGE_PROPERTY_TYPE',
                payload: {
                    entityId,
                    propertyId: property.id,
                    newType,
                },
            });
        } else {
            // If user cancels, reset the select to its original value to avoid UI inconsistency
            e.target.value = property.type;
        }
    };

    const ChoicesEditor = ({ entityId, property }) => {
        const handleAddChoice = () => {
            dispatch({ type: 'ADD_CHOICE', payload: { entityId, propertyId: property.id } });
        };

        const handleUpdateChoice = (choiceId, updates) => {
            dispatch({
                type: 'UPDATE_CHOICE',
                payload: { entityId, propertyId: property.id, choiceId, updates },
            });
        };

        const handleDeleteChoice = (choiceId) => {
            dispatch({ type: 'DELETE_CHOICE', payload: { entityId, propertyId: property.id, choiceId } });
        };

        return (
            <div className="type-specific-editor">
                <h4>Choices</h4>
                <div className="choices-list">
                    {(property.choices || []).map(choice => (
                        <div key={choice.id} className="choice-row">
                            <input
                                type="text"
                                value={choice.value}
                                onChange={(e) => handleUpdateChoice(choice.id, { value: e.target.value })}
                                placeholder="Value"
                                className="choice-input"
                            />
                            <input
                                type="text"
                                value={choice.displayName}
                                onChange={(e) => handleUpdateChoice(choice.id, { displayName: e.target.value })}
                                placeholder="Display Name"
                                className="choice-input"
                            />
                            <button onClick={() => handleDeleteChoice(choice.id)} className="delete-choice-btn">
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddChoice} className="add-choice-btn">
                    Add Choice
                </button>
            </div>
        );
    };

    const renderTypeSpecificEditor = () => {
        if (property.type === 'choices') {
            return <ChoicesEditor entityId={entityId} property={property} />;
        }

        if (property.type === 'flags') {
            const items = property.flags || [];

            return (
                <div className="type-specific-editor">
                    <h4>Flags</h4>
                    <p style={{fontSize: '0.9em', opacity: 0.7}}>
                        (Editor for these is not yet implemented. This is a placeholder.)
                    </p>
                    <ul>
                        {items.map((item, index) => (
                            <li key={item.id || index}>{item.value}: "{item.displayName}"</li>
                        ))}
                    </ul>
                </div>
            );
        }
        return null;
    };

    // Create a dynamic list of types for the dropdown.
    // This ensures that if an unknown type is loaded from an FGD,
    // it's still visible in the dropdown and can be changed.
    const availableTypes = [...PROPERTY_TYPES];
    if (property && !availableTypes.includes(property.type)) {
        availableTypes.push(property.type);
    }

    return (
        <div className="property-editor-wrapper">
            <div className="property-editor">
                {/* Column 1: Name and Type */}
                <div className="property-details">
                    <label>Name</label>
                    <input
                        type="text"
                        value={property.name}
                        onChange={(e) => handleUpdate({ name: e.target.value })}
                        placeholder="Property Name"
                    />
                </div>

                {/* Column 2: Display Name and Type */}
                <div className="property-details">
                    <label>Display Name</label>
                    <input
                        type="text"
                        value={property.displayName}
                        onChange={(e) => handleUpdate({ displayName: e.target.value })}
                        placeholder="Display Name (Optional)"
                    />
                </div>

                {/* Column 3: Type and Default Value */}
                <div className="property-details">
                    <label>Type</label>
                    <select value={property.type} onChange={handleTypeChange}>
                        {availableTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="property-details">
                    <label>Default Value</label>
                    <input
                        type="text"
                        value={property.defaultValue}
                        onChange={(e) => handleUpdate({ defaultValue: e.target.value })}
                        placeholder="Default Value"
                    />
                </div>

                {/* Spanning full width */}
                <div className="property-details-full">
                    <label>Description</label>
                    <textarea
                        value={property.description}
                        onChange={(e) => handleUpdate({ description: e.target.value })}
                        placeholder="Description (Optional)"
                        rows={2}
                    />
                </div>
            </div>

            {renderTypeSpecificEditor()}
        </div>
    );
};