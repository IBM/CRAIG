/**
 * initialize mock axios
 * @param {object} data arbitrary data to return
 * @param {boolean=} err reject data on error
 * @param {boolean} recursive true if axios is used in a recursive test
 * @returns {Promise} mock axios
 */
function initRecursiveMockAxios(data, err, recursive) {
  let timesCalled = -1;
  /**
   * moch axios promise
   * @returns {Promise} axios mock promise
   */
  function mockAxios() {
    timesCalled++;
    return new Promise((resolve, reject) => {
      if (err) reject(data);
      else resolve({ data: recursive ? data[timesCalled] : data });
    });
  }

  function constructor() {
    this.axios = mockAxios;
    this.axios.get = mockAxios;
    this.axios.post = mockAxios;
    this.axios.put = mockAxios;
    this.axios.patch = mockAxios;
    this.axios.delete = mockAxios;
  }
  return new constructor();
}

module.exports = { initRecursiveMockAxios };
