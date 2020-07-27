interface Move {
    type: 'remove' | 'insert';
    index: number;
    item?: any;
}

// KeyIndexFree
interface KeyIndexAndFree {
    keyIndex: {
        [key: string]: number
    };
    free: any[];
}

export default (oldList: any[], newList: any[], key: string): Move[] => {
    const moves: Move[] = [];
    const oldMap = makeKeyIndexAndFree(oldList, key);
    const newMap = makeKeyIndexAndFree(newList, key);
    const newFree = newMap.free;
    const oldKeyIndex = oldMap.keyIndex;
    const newKeyIndex = newMap.keyIndex;
    const simulateList: any[] = [];

    let freeIndex = 0;
    oldList.forEach((item, index) => {
        const itemKey = getItemKey(item, key);
        if (itemKey) {
            // If itemKey exist in newKeyIndex, then
            newKeyIndex.hasOwnProperty(itemKey) ? simulateList.push(newList[newKeyIndex[itemKey]]) : simulateList.push(null);
        } else {
            // If itemKey not exist, push the item in newFree to simulateList.
            simulateList.push(newFree[freeIndex++] || null);
        }
    });

    // remove operations
    simulateList.forEach((item, index) => {
        if (item === null) {
            remove(index);
            removeSimulate(index);
        }
    });

    // compare the simulateList and newList
    let i = 0, j = 0;
    while (i < newList.length) {
        const item = newList[i];
        const itemKey = getItemKey(item, key);

        const simulateItem = simulateList[j];
        const simulateItemKey = getItemKey(simulateItem, key);
        if (simulateItem) {
            if (simulateItemKey === itemKey) {
                j++
            } else {
                if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                    insert(i, item);
                } else {
                    const nextItemKey = getItemKey(simulateList[j+1], key);
                    if (nextItemKey === itemKey) {
                        remove(i);
                        removeSimulate(j);
                        j++
                    } else {
                        insert(i, item);
                    }
                }
            }
        } else {
            insert(i, item);
        }
        i++;
    }

    // if j is not remove to the end, remove all the rest item
    let k = simulateList.length - j;
    while(j++ < simulateList.length) {
        k--;
        remove(k + i);
    }


    function remove(index: number) {
        moves.push({
            type: 'remove',
            index,
        });
    }
    function insert(index: number, item: any) {
        moves.push({
            type: 'insert',
            index,
            item,
        });
    }
    function removeSimulate(index) {
        simulateList.splice(index, 1);
    }
    return moves;
};

function getItemKey(item: any, key: string|((item: any) => string)): string {
    if (!item || !key) return void 0;
    return typeof key === 'string' ? item[key] : key(item);
}

// convert list to keyIndex map
function makeKeyIndexAndFree(list: any[], key: string): KeyIndexAndFree {
    const keyIndex: {
        [key: string]: number;
    } = {};
    const free: any[] = [];
    list.forEach((item, index) => {
        const itemKey = getItemKey(item, key);
        itemKey ? keyIndex[itemKey] = index : free.push(item);
    });
    return {
        keyIndex,
        free,
    };
}
