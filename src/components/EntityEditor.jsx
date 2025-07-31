import React, { useState } from 'react';
import { useFGD } from '../context/FGDContext';
import { PropertyList } from './PropertyList';
import './EntityEditor.css';

const ENTITY_CLASS_TYPES = ['PointClass', 'SolidClass', 'BaseClass'];
const PROPERTY_TYPES = ['string', 'integer', 'float', 'boolean', 'choices', 'flags', 'custom'];

export const EntityEditor = () => {
    const { state, dispatch } = useFGD();

    // Move useState hooks here, before any return!
    const [name, setName] = useState('');
    const [type, setType] = useState('string');

    const selectedEntity = state.entities.find(
        (e) => e.id === state.selectedEntityId
    );

    // If no entity is selected, show a placeholder message
    if (!selectedEntity) {
        return (
            <div className="entity-editor-placeholder">
                <h2>Entity Editor</h2>
                <p>Select an entity from the list to begin editing.</p>
            </div>
        );
    }

    // Generic handler to update any field on the entity
    const handleUpdate = (field, value) => {
        dispatch({
            type: 'UPDATE_ENTITY',
            payload: {
                entityId: selectedEntity.id,
                updates: { [field]: value },
            },
        });
    };

    const handleBaseClassesChange = (e) => {
        const baseClasses = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        handleUpdate('baseClasses', baseClasses);
    };

    // Create a dynamic list of class types for the dropdown.
    // This ensures that if an unknown type is loaded from an FGD,
    // it's still visible in the dropdown and can be changed.
    const availableClassTypes = [...ENTITY_CLASS_TYPES];
    if (selectedEntity && !availableClassTypes.includes(selectedEntity.classType)) {
        availableClassTypes.push(selectedEntity.classType);
    }

    const handleAdd = () => {
        if (!name.trim()) return;
        dispatch({
            type: 'ADD_PROPERTY',
            payload: {
                entityId: selectedEntity.id,
                property: {
                    id: crypto.randomUUID(),
                    name,
                    type,
                    displayName: '',
                    defaultValue: '',
                    description: '',
                }
            }
        });
        setName('');
        setType('string');
    };

    return (
        <div className="entity-editor">
            <header className="entity-editor-header">
                <h2>Editing: {selectedEntity.name}</h2>
            </header>

            <form className="entity-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label htmlFor="entity-name">Name</label>
                    <input
                        id="entity-name"
                        type="text"
                        value={selectedEntity.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="entity-classType">Class Type</label>
                    <select
                        id="entity-classType"
                        value={selectedEntity.classType}
                        onChange={(e) => handleUpdate('classType', e.target.value)}
                    >
                        {availableClassTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="entity-baseClasses">Base Classes (comma-separated)</label>
                    <input
                        id="entity-baseClasses"
                        type="text"
                        value={selectedEntity.baseClasses.join(', ')}
                        onChange={handleBaseClassesChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="entity-description">Description</label>
                    <textarea
                        id="entity-description"
                        rows="3"
                        value={selectedEntity.description}
                        onChange={(e) => handleUpdate('description', e.target.value)}
                    ></textarea>
                </div>
            </form>

            {/* This is where the PropertyList component will go */}
            <div className="property-list-container">
                <PropertyList entityId={selectedEntity.id} />
            </div>

            <div>
                <h3>Add Property</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Property Name"
                    />
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                    >
                        {PROPERTY_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAdd}
                    >
                        Add Property
                    </button>
                </div>
            </div>
        </div>
    );
};