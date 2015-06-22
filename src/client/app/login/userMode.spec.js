/* jshint -W117, -W030 */
describe('UserMode', function() {
    var controller;

    beforeEach(function() {
        bard.appModule('app.login');
        bard.inject('$controller', '$rootScope', 'common', 'security');
    });

    beforeEach(function() {
        controller = $controller('UserMode');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('UserMode controller', function() {
        it('should be created successfully', function() {
            expect(controller).to.be.defined;
        });
    });
});
