import pick from 'lodash/pick';
import isFunction from 'lodash/isFunction';

/**
 * @example
 *  this.handleScroll = ({ scrollY }) => {};
 *  this.handleScroll = hookEventToRequestAnimationFrame(this.handleScroll, 'scrollY');
 *  // or
 *  this.handleScroll = hookEventToRequestAnimationFrame(this.handleScroll, (el) => el.scrollY);
 *  elem.addEventListener('scroll', this.handleScroll);
 *  elem.removeEventListener('scroll', this.handleScroll);
 */
export const hookEventToRequestAnimationFrame = (callback, paths) => {
  let lastInformation = null;
  let ticking = false;
  return e => {
    lastInformation = isFunction(paths)
      ? paths(e.target)
      : pick(e.target, paths);
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback(lastInformation, e);
        ticking = false;
      });
      ticking = true;
    }
  };
};

export default hookEventToRequestAnimationFrame;
