/**
 * ResuMate Drag and Drop Manager
 * Implements HTML5 drag-and-drop API for section reordering
 */

class DragDropManager {
    constructor(state, history) {
        this.state = state;
        this.history = history;
        this.draggedElement = null;
        this.draggedSectionId = null;
        this.dropIndicator = null;
        this.isDragging = false;

        this.initialize();
    }

    /**
     * Initialize drag and drop
     */
    initialize() {
        this.createDropIndicator();
        this.attachGlobalListeners();
    }

    /**
     * Create visual drop indicator
     */
    createDropIndicator() {
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'drop-indicator';
        this.dropIndicator.style.display = 'none';
        this.dropIndicator.innerHTML = '<div class="drop-indicator-line"></div>';
        document.body.appendChild(this.dropIndicator);
    }

    /**
     * Attach global event listeners
     */
    attachGlobalListeners() {
        // Clean up on drag end
        document.addEventListener('dragend', () => {
            this.cleanupDragState();
        });

        // Prevent default drag over
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Make an element draggable
     */
    makeDraggable(element, sectionId) {
        element.setAttribute('draggable', 'true');
        element.dataset.sectionId = sectionId;

        // Drag start
        element.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, element, sectionId);
        });

        // Drag end
        element.addEventListener('dragend', (e) => {
            this.handleDragEnd(e, element);
        });

        // Drag over (for drop zones)
        element.addEventListener('dragover', (e) => {
            this.handleDragOver(e, element, sectionId);
        });

        // Drop
        element.addEventListener('drop', (e) => {
            this.handleDrop(e, element, sectionId);
        });

        // Visual feedback
        element.addEventListener('dragenter', (e) => {
            this.handleDragEnter(e, element);
        });

        element.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e, element);
        });
    }

    /**
     * Handle drag start
     */
    handleDragStart(e, element, sectionId) {
        this.draggedElement = element;
        this.draggedSectionId = sectionId;
        this.isDragging = true;

        // Set drag data
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', sectionId);

        // Add dragging class
        element.classList.add('dragging');

        // Update state
        this.state.updateUIState({
            isDragging: true,
            draggedSectionId: sectionId
        });

        // Create drag image
        this.createDragImage(e, element);

        console.log('Drag started:', sectionId);
    }

    /**
     * Create custom drag image
     */
    createDragImage(e, element) {
        const dragImage = element.cloneNode(true);
        dragImage.style.opacity = '0.8';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        dragImage.style.width = element.offsetWidth + 'px';
        document.body.appendChild(dragImage);

        e.dataTransfer.setDragImage(dragImage,
            e.offsetX || element.offsetWidth / 2,
            e.offsetY || 20
        );

        // Remove after drag starts
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }

    /**
     * Handle drag over
     */
    handleDragOver(e, element, sectionId) {
        if (!this.isDragging || sectionId === this.draggedSectionId) {
            return;
        }

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Show drop indicator
        this.showDropIndicator(e, element);
    }

    /**
     * Show drop indicator at appropriate position
     */
    showDropIndicator(e, element) {
        const rect = element.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midpoint;

        this.dropIndicator.style.display = 'block';
        this.dropIndicator.style.width = element.offsetWidth + 'px';
        this.dropIndicator.style.left = rect.left + 'px';

        if (insertBefore) {
            this.dropIndicator.style.top = rect.top + 'px';
            this.dropIndicator.dataset.position = 'before';
        } else {
            this.dropIndicator.style.top = rect.bottom + 'px';
            this.dropIndicator.dataset.position = 'after';
        }
    }

    /**
     * Handle drag enter
     */
    handleDragEnter(e, element) {
        if (!this.isDragging || element === this.draggedElement) {
            return;
        }
        element.classList.add('drag-over');
    }

    /**
     * Handle drag leave
     */
    handleDragLeave(e, element) {
        element.classList.remove('drag-over');
    }

    /**
     * Handle drop
     */
    handleDrop(e, element, targetSectionId) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.isDragging || !this.draggedSectionId) {
            return;
        }

        if (this.draggedSectionId === targetSectionId) {
            this.cleanupDragState();
            return;
        }

        // Get drop position
        const rect = element.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midpoint;

        // Perform the reorder
        this.reorderSections(this.draggedSectionId, targetSectionId, insertBefore);

        this.cleanupDragState();
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e, element) {
        this.cleanupDragState();
    }

    /**
     * Reorder sections in state
     */
    reorderSections(draggedId, targetId, insertBefore) {
        const sections = this.state.getSections();

        // Find indices
        const draggedIndex = sections.findIndex(s => s.id === draggedId);
        const targetIndex = sections.findIndex(s => s.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            console.error('Section not found:', { draggedId, targetId });
            return;
        }

        // Calculate new index
        let newIndex = targetIndex;
        if (!insertBefore) {
            newIndex += 1;
        }
        if (draggedIndex < targetIndex && insertBefore) {
            newIndex -= 1;
        }

        // Save state to history before modifying
        if (this.history) {
            this.history.saveState();
        }

        // Reorder
        this.state.reorderSections(draggedIndex, newIndex);

        console.log('Sections reordered:', {
            from: draggedIndex,
            to: newIndex,
            draggedId,
            targetId
        });
    }

    /**
     * Clean up drag state
     */
    cleanupDragState() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }

        // Remove drag-over class from all elements
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Hide drop indicator
        if (this.dropIndicator) {
            this.dropIndicator.style.display = 'none';
        }

        // Reset state
        this.draggedElement = null;
        this.draggedSectionId = null;
        this.isDragging = false;

        this.state.updateUIState({
            isDragging: false,
            draggedSectionId: null
        });
    }

    /**
     * Enable dragging for all sections
     */
    enableDragging(container) {
        const sections = container.querySelectorAll('[data-section-id]');
        sections.forEach(section => {
            const sectionId = section.dataset.sectionId;
            this.makeDraggable(section, sectionId);
        });
    }

    /**
     * Disable dragging for all sections
     */
    disableDragging(container) {
        const sections = container.querySelectorAll('[data-section-id]');
        sections.forEach(section => {
            section.setAttribute('draggable', 'false');
            section.classList.remove('dragging', 'drag-over');
        });
    }

    /**
     * Refresh draggable elements
     */
    refresh(container) {
        this.enableDragging(container);
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.cleanupDragState();
        if (this.dropIndicator && this.dropIndicator.parentNode) {
            this.dropIndicator.parentNode.removeChild(this.dropIndicator);
        }
    }
}

/**
 * Touch Support for Mobile Drag and Drop
 */
class TouchDragSupport {
    constructor(dragDropManager) {
        this.dragDropManager = dragDropManager;
        this.touchTarget = null;
        this.touchStartY = 0;
        this.isDragging = false;
    }

    /**
     * Enable touch support for an element
     */
    enableTouch(element, sectionId) {
        element.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e, element, sectionId);
        });

        element.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e, element);
        });

        element.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        });
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e, element, sectionId) {
        this.touchTarget = element;
        this.touchStartY = e.touches[0].clientY;
        this.isDragging = false;

        // Add visual feedback after slight delay
        setTimeout(() => {
            if (this.touchTarget === element) {
                element.classList.add('touch-dragging');
                this.isDragging = true;
            }
        }, 200);
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e, element) {
        if (!this.isDragging) return;

        e.preventDefault();

        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

        if (targetElement && targetElement.dataset.sectionId) {
            // Show drop indicator
            const rect = targetElement.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const insertBefore = touch.clientY < midpoint;

            this.dragDropManager.showDropIndicator({
                clientY: touch.clientY
            }, targetElement);
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (this.touchTarget) {
            this.touchTarget.classList.remove('touch-dragging');
        }

        if (this.isDragging) {
            // Perform drop
            const touch = e.changedTouches[0];
            const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

            if (targetElement && targetElement.dataset.sectionId &&
                this.touchTarget && this.touchTarget.dataset.sectionId) {

                const draggedId = this.touchTarget.dataset.sectionId;
                const targetId = targetElement.dataset.sectionId;

                if (draggedId !== targetId) {
                    const rect = targetElement.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;
                    const insertBefore = touch.clientY < midpoint;

                    this.dragDropManager.reorderSections(draggedId, targetId, insertBefore);
                }
            }

            this.dragDropManager.cleanupDragState();
        }

        this.touchTarget = null;
        this.isDragging = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DragDropManager, TouchDragSupport };
}
