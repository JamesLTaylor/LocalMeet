class CategoryTag {
  /**
   * @param {Object} options
   * @param {string} options.name - The name of the category tag
   * @param {string} [options.description] - The description of the category tag
   */
  constructor({ name, description = '' }) {
    this.name = name;
    this.description = description;
  }
}

module.exports = CategoryTag;
