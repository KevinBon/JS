/**
 * @example
 *  this.handleScroll = (target) => {};
 *  this.handleScroll = hookEventToRequestAnimationFrame(this.handleScroll);
 *  elem.addEventListener('scroll', this.handleScroll);
 *  elem.removeEventListener('scroll', this.handleScroll);
 */
export const hookEventToRequestAnimationFrame = callback => {
  let ticking = false;
  return e => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback(e);
        ticking = false;
      });
      ticking = true;
    }
  };
};

export default hookEventToRequestAnimationFrame;
