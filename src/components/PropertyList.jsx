import React from 'react';
import { useFGD } from '../context/FGDContext';
import { PropertyEditor } from './PropertyEditor';
import './PropertyList.css'; // For styling later

export const PropertyList = ({ entityId }) => {
    const { state, dispatch } = useFGD();

    // Find the current entity to get its properties
    const entity = state.entities.find((e) => e.id === entityId);

    if (!entity) {
        // This should ideally not happen if the UI is structured correctly
        return <p>Error: Could not find the specified entity.</p>;
    }

    const handleAddProperty = () => {
        dispatch({
            type: 'ADD_PROPERTY',
            payload: {
                entityId,
                property: {
                    id: crypto.randomUUID(),
                    name: 'new_property',
                    type: 'string',
                    displayName: '',
                    defaultValue: '',
                    description: '',
                }
            },
        });
    };

    const handleDeleteProperty = (propertyId) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            dispatch({
                type: 'DELETE_PROPERTY',
                payload: { entityId, propertyId },
            });
        }
    };

    return (
        <div className="property-list">
            <header className="property-list-header">
                <h3>Properties</h3>
                <button onClick={handleAddProperty} className="add-property-btn">
                    Add Property
                </button>
            </header>
            <div className="properties-container">
                {(entity.properties || []).map((prop) => (
                    <div key={prop.id} className="property-row">
                        <PropertyEditor entityId={entityId} property={prop} />
                        <button
                            className="delete-property-btn"
                            onClick={() => handleDeleteProperty(prop.id)}
                            title="Delete Property"
                        >
                            &times;
                        </button>
                    </div>
                ))}
                {(entity.properties || []).length === 0 && (
                    <p className="no-properties-message">This entity has no properties. Click "Add Property" to begin.</p>
                )}
            </div>
        </div>
    );
};