const chai = require("chai");
const { expect } = require("chai");
const { Page } = require("../models");
const spies = require("chai-spies");
chai.use(spies);

describe("Page Model", function () {
  before(() => {
    return Page.sync({ force: true }); //sincronize and update sequelize
  });

  describe("Virtuals", function () {
    let page; // para evitar hacer el Page.create en cada test, puedo definirlo en el beforeEach e impactaría en todos
    beforeEach(function () {
      page = Page.build({
        title: "Hello World",
        urlTitle: "Hello_World",
        content: "content is here",
      });
    });
    // urlTitle lo harcodeo, porque estoy solamente testeando
    // la funcionalidad de rutas, en otro test, testearé
    // la funcionalidad de urlTitle.

    describe("route", function () {
      it("Should create the proper route", function () {
        expect(page.route).to.equal("/wiki/Hello_World");
      });
    });

    describe("renderContent", function(){
      it('convierte el contenido formateado en Markdown a HTML'), function(){
        expect(page.renderedContent).to.equal("<p>content is here</p>\n")
      }

      it("responde a lo cambios del content", function(){
        page.content =  '# contenido renderContent'
        expect(page.renderedContent).to.equal('<h1 id="contenido-rendercontent">contenido renderContent</h1>\n')
      })
    })
  });



  describe("Static - Class Methods", function () {
    before(function () {
      return Page.create({
        title: "Hello World",
        content: "content is here",
        tags: ["hello", "YOLO", "World", "Career"],
      }).then(function () {
        return Page.create({
          title: "Goodbye World",
          content: "content is here",
          tags: ["Goodbye", "LOL", "Fullstack", "YOLO"],
        });
      });
    });
    describe("findByTag", function () {
      it("should find one page for one tag", function () {
        return Page.findByTag(["Goodbye"]).then(function (pages) {
          expect(pages[0].title).to.equal("Goodbye World");
        });
      });
      it("should find one page for multiple tags", function () {
        return Page.findByTag(["Goodbye", "Nothing"]).then(function (pages) {
          expect(pages[0].title).to.equal("Goodbye World");
        });
      });

      it("should find multiple pages for one tag", function () {
        return Page.findByTag(["YOLO"]).then(function (pages) {
          expect(pages).to.have.lengthOf(2);
        });
      });

      it("should find no pages for no coincidence tag", function () {
        return Page.findByTag(["Nothing"]).then(function (pages) {
          expect(pages).to.have.lengthOf(0);
        });
      });
      it("should find multiple pages for multiple tags", function () {
        return Page.findByTag(["hello", "Goodbye"]).then(function (pages) {
          expect(pages).to.have.lengthOf(2);
        });
      });
    });
  });

  describe("Instance Method", function () {
    before(function () {
      return Page.bulkCreate([
        {
          title: "Hello",
          content: "Hello",
          tags: ["Hello", "LOL"],
          urlTitle: "Hello",
        },
        {
          title: "Bye",
          content: "Bye",
          tags: ["Bye"],
          urlTitle: "Bye",
        },
        {
          title: "Hello2",
          content: "Hello2",
          tags: ["Hello"],
          urlTitle: "Hello2",
        },
      ]);
    });

    it("findSimilar: should not find pages if it doesn't have similar tags", function () {
      return Page.findOne({
        where: {
          title: "Bye",
        },
      })
        .then(function (page) {
          return page.findSimilar();
        })
        .then(function (similarPages) {
          expect(similarPages).to.have.lengthOf(0);
        });
    });

    it("should find pages if it has similar tags", function () {
      return Page.findOne({
        where: {
          title: "Hello",
        },
      })
        .then(function (page) {
          return page.findSimilar();
        })
        .then(function (similarPages) {
          expect(similarPages).to.have.lengthOf(2);
          expect(similarPages[0].title).to.equal("Goodbye World");
          expect(similarPages[1].title).to.equal("Hello2");
        });
    });
  });

  describe("Validators", function () {
    describe("Title", function () {
      it("Should throw an error if not a String", function () {
        var page = Page.build({
          title: [],
          content: "Hello2",
          urlTitle: "hello",
        });
        return page.validate().catch(function (error) {
          expect(error.message).to.be.equal(
            "string violation: title cannot be an array or an object"
          );
        });
      });
      it("Should throw an error if no title defined", function () {
        return Page.create({
          title: null,
          content: "Hello2",
          urlTitle: "hello",
        }).catch(function (error) {
          expect(error.message).to.be.equal(
            "notNull Violation: page.title cannot be null"
          );
        });
      });
      it("Shouldn't throw an error if it is a String", function () {
        return Page.create({
          title: "hello",
          content: "Hello2",
          urlTitle: "hello",
        }).catch(function (error) {
          expect(error).to.be.equal(null);
        });
      });
    });
    describe("urlTitle", function () {
      it("Should throw an error if not a String", function () {
        return Page.create({
          title: "hello",
          content: "Hello2",
          urlTitle: [],
        }).catch(function (error) {
          expect(error.message).to.be.equal(
            "string violation: urlTitle cannot be an array or an object"
          );
        });
      });
      it("Should throw an error if no urlTitle defined", function () {
        return Page.create({
          title: "hello",
          content: "hello",
        }).catch(function (error) {
          expect(error.message).to.be.equal(
            "notNull Violation: urlTitle cannot be null"
          );
        });
      });
      it("Shouldn't throw an error if it is a String", function () {
        return Page.create({
          title: "hello",
          content: "Hello2",
          urlTitle: "hello",
        }).catch(function (error) {
          expect(error).to.be.equal(null);
        });
      });
    });
    describe("content", function () {
      it("Should throw an error if not a String", function () {
        return Page.create({
          title: "hello",
          content: [],
          urlTitle: "hello",
        }).catch(function (error) {
          expect(error.message).to.be.equal(
            "string violation: content cannot be an array or an object"
          );
        });
      });
      it("Should throw an error if no content defined", function () {
        return Page.create({
          title: "hello",
          urlTitle: "hello",
        }).catch(function (error) {
          expect(error.message).to.be.equal(
            "notNull Violation: page.content cannot be null"
          );
        });
      });
      it("Shouldn't throw an error if it is a String", function () {
        return Page.create({
          title: "hello",
          content: "Hello2",
          urlTitle: "hello",
        }).catch(function (error) {
          expect(error).to.be.equal(null);
        });
      });
    });

    describe("status", function () {
      it("Should throw an error if not a valid value", function () {
        return Page.create({
          title: "hello",
          content: "hello",
          urlTitle: "hello",
          status: "hello",
        }).catch(function (error) {
          //recheck(?)
          expect(error.message).to.be.equal(
            'invalid input value for enum enum_pages_status: "hello"'
          );
        });
      });
      it("Shouldn't throw an error if it is a valid value", function () {
        return Page.create({
          title: "hello",
          content: "Hello2",
          urlTitle: "hello",
          status: "open",
        }).catch(function (error) {
          expect(error).to.be.equal(null);
        });
      });
    });
    describe("tags", function () {
      it("Should throw an error if not a valid array", function () {
        return Page.create({
          title: "hello",
          content: "hello",
          urlTitle: "hello",
          tags: "hello",
        }).catch(function (error) {
          expect(error.message).to.be.equal(
            "Validation error: arr.forEach is not a function"
          );
        });
      });
      it("Should throw an error if not a valid array of strings", function () {
        return Page.create({
          title: "hello",
          content: "hello",
          urlTitle: "hello",
          tags: [[], []],
        }).catch(function (error) {
          expect(error.message).to.be.equal(
            "Validation error: Should be an Array of Strings"
          );
        });
      });
      it("Shouldn't throw an error if it is a valid array of strings", function () {
        return Page.create({
          title: "hello",
          content: "Hello2",
          urlTitle: "hello",
          tags: ["hello"],
        }).catch(function (error) {
          expect(error).to.be.equal(null);
        });
      });
    });
  });
  describe("Hooks", function () {
    describe("UrlTitle", function () {
      it("should create a proper urlTitle after validating the page", function () {
        return Page.create({
          title: "Hello World!",
          content: "blah blah",
        }).then(function (page) {
          expect(page.urlTitle).to.exist;
          expect(page.urlTitle).to.equal("Hello_World");
        });
      });
    });
  });
});

/* -------------------------------------------------------------------------------------- */

/** HOOKS *
describe('hooks', function() {

    before(function() {
        // runs before all tests in this file regardless where this line is defined.
    });

    after(function() {
        // runs after all tests in this file
    });

    beforeEach(function() {
        // runs before each test in this block
    });

    afterEach(function() {
        // runs after each test in this block
    });

    // test cases
});
*/
/*** HOOKS ***/

/** SCOPING  */
// https://sittinginoblivion.com/wiki/beforeeach-scope-jasmine-unit-tests
/*********/
