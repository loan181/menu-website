import details from './details.json'
import page1 from './menus/page1.json'
import page2 from './menus/page2.json'
import page3 from './menus/page3.json'
import page4 from './menus/page4.json'
import page5 from './menus/page5.json'
import page6 from './menus/page6.json'

export const menuData = {
  ingredient_details: details,
  menus: [
    ...page1,
    ...page2,
    ...page3,
    ...page4,
    ...page5,
    ...page6
  ]
}
