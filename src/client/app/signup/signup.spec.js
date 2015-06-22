/* jshint -W117, -W030 */
describe('SignUp', function() {
    var controller;

    beforeEach(function() {
        bard.appModule('app.signup');
        bard.inject('$controller', '$rootScope', '$state', 'common', 'security');
    });

    beforeEach(function() {
        controller = $controller('SignUp');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('SignUp controller', function() {
        it('should be created successfully', function() {
            expect(controller).to.be.defined;
        });
    });
});
