/* jshint -W117, -W030 */
describe('Welcome', function() {
    var controller;

    beforeEach(function() {
        bard.appModule('app.welcome');
        bard.inject('$controller', '$rootScope', 'common', 'security');
    });

    beforeEach(function() {
        controller = $controller('Welcome');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('Welcome controller', function() {
        it('should be created successfully', function() {
            expect(controller).to.be.defined;
        });
    });
});
