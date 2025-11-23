import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">REI OPS™</span>
            <Badge variant="outline" className="ml-2">🇨🇦</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline">Pricing</Link>
            <Link href="/login" className="text-sm font-medium hover:underline">Sign In</Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/login">
              <Button size="sm" variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4">The Only Canadian Real Estate Analysis Platform</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Analyze Canadian Real Estate Deals{" "}
            <span className="text-primary">Like a Pro</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            CMHC insurance. Land transfer taxes. OSFI stress tests. We speak Canadian.
            Stop using US-focused tools that miss critical Canadian nuances.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Analysis
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Built for Canadian Investors</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every existing tool misses critical Canadian requirements. We got you covered.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🇨🇦 Canadian-Specific
                </CardTitle>
                <CardDescription>Calculations That Actually Work</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Accurate CMHC insurance premiums</li>
                  <li>• Provincial land transfer taxes</li>
                  <li>• OSFI B-20 stress test compliance</li>
                  <li>• Multi-unit financing differences</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Complete Analysis
                </CardTitle>
                <CardDescription>All Metrics That Matter</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Cash flow projections</li>
                  <li>• Cap rate & CoC return</li>
                  <li>• BRRRR strategy analysis</li>
                  <li>• Deal scoring (A-F grades)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💼 Portfolio Tracking
                </CardTitle>
                <CardDescription>Manage All Your Deals</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Save unlimited deals</li>
                  <li>• Compare opportunities</li>
                  <li>• Export PDF reports</li>
                  <li>• Track deal status</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Market Intelligence
                </CardTitle>
                <CardDescription>Regional Benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Cap rates by city</li>
                  <li>• Rent-to-price ratios</li>
                  <li>• Operating expense benchmarks</li>
                  <li>• Days on market averages</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Lightning Fast
                </CardTitle>
                <CardDescription>Instant Results</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Real-time calculations</li>
                  <li>• No page refreshes needed</li>
                  <li>• Save deals in seconds</li>
                  <li>• Mobile responsive</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔒 Secure & Private
                </CardTitle>
                <CardDescription>Your Data, Protected</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Bank-level encryption</li>
                  <li>• Private deal storage</li>
                  <li>• No data sharing</li>
                  <li>• GDPR compliant</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you're ready.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li>• 3 deals per month</li>
                  <li>• Basic analysis</li>
                  <li>• Deal scoring</li>
                  <li>• Community support</li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For serious investors</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$34</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li>• Unlimited deals</li>
                  <li>• PDF exports</li>
                  <li>• BRRRR analysis</li>
                  <li>• Priority support</li>
                  <li>• Deal comparison</li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For teams & brokers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$219</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li>• Everything in Pro</li>
                  <li>• Team collaboration</li>
                  <li>• White-label reports</li>
                  <li>• API access</li>
                  <li>• Dedicated support</li>
                </ul>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Analyze Your First Deal?
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Join hundreds of Canadian investors making smarter decisions with REI OPS™
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Start Free Analysis →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <span className="text-lg font-bold">REI OPS™</span>
              <p className="mt-2 text-sm text-muted-foreground">
                The definitive Canadian real estate analysis platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Contact</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 REI OPS™. All rights reserved. Built with ❤️ for Canadian real estate investors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
