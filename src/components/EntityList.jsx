import React from 'react';
import { useFGD } from '../context/FGDContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * A sortable item component that uses dnd-kit's useSortable hook.
 * It handles the drag-and-drop state and styles.
 */
const SortableEntityItem = ({ entity, isSelected, onSelect, onDelete, isDragModeEnabled }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: entity.id, disabled: !isDragModeEnabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto', // Ensure dragging item is on top
    };

    // Conditionally apply drag listeners only when drag mode is enabled
    const dragListeners = isDragModeEnabled ? listeners : {};

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...dragListeners} className={`draggable-item-wrapper ${isDragging ? 'is-dragging' : ''}`}>
            <div
                className={`entity-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(entity.id)}
            >
                <span className="entity-name">{entity.name}</span>
                <button onClick={(e) => onDelete(e, entity.id)} title="Delete Entity">&times;</button>
            </div>
        </div>
    );
};

export const EntityList = ({ isDragModeEnabled }) => {
    const { state, dispatch } = useFGD();
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSelectEntity = (id) => {
        dispatch({
            type: 'SELECT_ENTITY',
            payload: { id },
        });
    };

    const handleDeleteEntity = (e, entityId) => {
        e.stopPropagation(); // Prevent selection when deleting
        if (window.confirm('Are you sure you want to delete this entity?')) {
            dispatch({ type: 'DELETE_ENTITY', payload: { entityId } });
        }
    };

    const handleAddEntity = () => {
        dispatch({ type: 'ADD_ENTITY' });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = state.entities.findIndex((e) => e.id === active.id);
            const newIndex = state.entities.findIndex((e) => e.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                dispatch({
                    type: 'REORDER_ENTITIES',
                    payload: {
                        sourceIndex: oldIndex,
                        destinationIndex: newIndex,
                    },
                });
            }
        }
    };

    const entityIds = state.entities.map(e => e.id);

    return (
        <div className="entity-list-panel">
            <header className="entity-list-header">
                <h2>Entities</h2>
                <button onClick={handleAddEntity}>+ Add Entity</button>
            </header>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className={`entity-list-container ${isDragModeEnabled ? 'drag-mode-enabled' : ''}`}>
                    <SortableContext items={entityIds} strategy={verticalListSortingStrategy}>
                        {state.entities.map(entity => (
                            <SortableEntityItem
                                key={entity.id}
                                entity={entity}
                                isSelected={entity.id === state.selectedEntityId}
                                onSelect={handleSelectEntity}
                                onDelete={handleDeleteEntity}
                                isDragModeEnabled={isDragModeEnabled}
                            />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        </div>
    );
};