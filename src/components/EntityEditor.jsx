import React from 'react';
import { useFGD } from '../context/FGDContext';
// We will create and import these later
import { PropertyList } from './PropertyList';
// import './EntityEditor.css';

const ENTITY_CLASS_TYPES = ['PointClass', 'SolidClass', 'BaseClass'];

export const EntityEditor = () => {
    const { state, dispatch } = useFGD();

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
        </div>
    );
};