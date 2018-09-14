const BOOTSTRAP_GRID_SIZE = 12;
const maxGrid = (min) => (nbElements, grid) => Math.max(min, Math.floor(grid / (nbElements || 1)));
const calcCols = maxGrid(1);
const calcOffset = maxGrid(0);

// Get bootstrap cls max size
const getMaxSizedCls = (nbElements, viewPortPrefix = 'col-md') => `${viewPortPrefix}-${String(calcCols(nbElements, BOOTSTRAP_GRID_SIZE))}`;

// Get bootstrap cls allowing to dynamically centered elements based on a maximum of elements
const getCenteredCls = (nbElements, maxElements, viewPortPrefix = 'col-md') => {
    const clsByBox = calcCols(maxElements, BOOTSTRAP_GRID_SIZE);
    const diff = maxElements - nbElements;
    const offsetGrid = diff > 0 ? clsByBox * diff : 0;
    const offset = calcOffset(nbElements, offsetGrid);
    const finalOffset = offset > 0 ? (offset / diff) : 0;
    let finalCls = `${viewPortPrefix}-${String(clsByBox)}`;
    if (finalOffset > 0)
        finalCls = `${finalCls} ${viewPortPrefix}-offset-${String(finalOffset)}`;
    return finalCls;
};
