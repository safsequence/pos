import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "",
    businessId: ""
  });
  const [registerForm, setRegisterForm] = useState({
    business: {
      name: "",
      email: "",
      phone: "",
      address: ""
    },
    user: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      username: loginForm.username,
      businessId: parseInt(loginForm.businessId)
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(registerForm);
  };

  return (
    <div className="min-h-screen emerald-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-2xl">Z</span>
            </div>
            <h1 className="text-3xl font-bold text-white">ZnForge POS</h1>
          </div>
          <p className="text-emerald-100">Modern Point of Sale System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Get Started</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessId">Business ID</Label>
                    <Input
                      id="businessId"
                      type="number"
                      value={loginForm.businessId}
                      onChange={(e) => setLoginForm({...loginForm, businessId: e.target.value})}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                
                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <div className="font-medium text-emerald-700">Admin Access</div>
                        <div className="text-gray-600">Business ID: 1, Username: admin</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLoginForm({username: 'admin', businessId: '1'})}
                      >
                        Use
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <div className="font-medium text-blue-700">Employee Access</div>
                        <div className="text-gray-600">Business ID: 1, Username: employee1</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLoginForm({username: 'employee1', businessId: '1'})}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Click "Use" to auto-fill credentials, then click "Sign In"
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">Business Information</h3>
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={registerForm.business.name}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          business: {...registerForm.business, name: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={registerForm.business.email}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          business: {...registerForm.business, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Admin User</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={registerForm.user.firstName}
                          onChange={(e) => setRegisterForm({
                            ...registerForm,
                            user: {...registerForm.user, firstName: e.target.value}
                          })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={registerForm.user.lastName}
                          onChange={(e) => setRegisterForm({
                            ...registerForm,
                            user: {...registerForm.user, lastName: e.target.value}
                          })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="userUsername">Username</Label>
                      <Input
                        id="userUsername"
                        value={registerForm.user.username}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          user: {...registerForm.user, username: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={registerForm.user.email}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          user: {...registerForm.user, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={registerForm.user.password}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          user: {...registerForm.user, password: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isRegistering}
                  >
                    {isRegistering ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
