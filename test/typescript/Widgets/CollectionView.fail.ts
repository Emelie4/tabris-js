import {CollectionView} from 'tabris';

let widget = new CollectionView();

const firstVisibleIndex = widget.firstVisibleIndex;
widget = new CollectionView({firstVisibleIndex});
widget.set({firstVisibleIndex});
widget.firstVisibleIndex = firstVisibleIndex;

const lastVisibleIndex = widget.lastVisibleIndex;
widget = new CollectionView({lastVisibleIndex});
widget.set({lastVisibleIndex});
widget.lastVisibleIndex = lastVisibleIndex;

/*Expected
(6,
(8,
firstVisibleIndex

(11,
(13,
lastVisibleIndex
*/
