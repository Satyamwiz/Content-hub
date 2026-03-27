import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  Zap,
  Shield,
  Sparkles,
  Video,
  Instagram,
  Youtube,
  Calendar,
  Mic,
  BarChart3,
  CheckCircle,
  Globe,
  Palette,
  Bot,
  TrendingUp,
  Clock,
  Target,
  Share2,
  Search,
  Twitter,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-linear-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 animate-in slide-in-from-top duration-300">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 group">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <span className="text-lg sm:text-xl font-bold">ContentHub</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <a
              href="#features"
              className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <ModeToggle />
            <SignedOut>
              <Link href="/sign-in" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Button asChild size="sm">
                <Link href="/dashboard">
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Go</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center animate-in fade-in slide-in-from-bottom duration-700">
            <Badge
              variant="secondary"
              className="mb-4 text-xs sm:text-sm animate-in fade-in slide-in-from-top duration-500 delay-200"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered Content Creation
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl animate-in fade-in slide-in-from-bottom duration-700 delay-300 px-4">
              Create Stunning
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-pulse">
                {" "}
                Social Content{" "}
              </span>
              in Minutes
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-500 px-4">
              Transform your content creation workflow with AI-powered tools for
              YouTube, Instagram, and more. Generate videos, voiceovers, and
              social posts that engage your audience.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-700 px-4">
              <SignedOut>
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Start Creating Free
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  asChild
                >
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </SignedIn>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 transition-all duration-300 hover:scale-105 hover:shadow-md group"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom duration-700 delay-1000">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 border-2 border-background animate-in fade-in zoom-in duration-500 delay-1200"></div>
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 border-2 border-background animate-in fade-in zoom-in duration-500 delay-1300"></div>
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/30 border-2 border-background animate-in fade-in zoom-in duration-500 delay-1400"></div>
                </div>
                <span>10,000+ creators</span>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                <span>4.9/5 rating</span>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-1">
                <Globe
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin"
                  style={{ animationDuration: "8s" }}
                />
                <span>50+ countries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[600px] bg-linear-to-r from-primary/20 to-purple-600/20 rounded-full blur-3xl opacity-20"></div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight px-4">
              Everything you need to create amazing content
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-4">
              From AI video generation to social media scheduling, we've got all
              your content creation needs covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards - Uniform Layout with Ticks */}
            
            {/* AI Video Generation */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-in fade-in slide-in-from-left delay-200 group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Video className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-3" />
                  </div>
                  <div>
                    <CardTitle>AI Video Generation</CardTitle>
                    <CardDescription>
                      Create stunning videos from images and prompts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Text-to-video generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Multiple aspect ratios</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>HD quality videos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Automation */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-in fade-in slide-in-from-bottom delay-300 group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-linear-to-br from-pink-500/10 via-red-500/10 to-blue-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Share2 className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <div>
                    <CardTitle>Social Media Automation</CardTitle>
                    <CardDescription>
                      Multi-platform publishing & analytics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="flex items-center gap-1">
                      <Instagram className="h-3.5 w-3.5 text-pink-500" />
                      Instagram posts & stories
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="flex items-center gap-1">
                      <Youtube className="h-3.5 w-3.5 text-red-500" />
                      YouTube video uploads
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="flex items-center gap-1">
                      <Twitter className="h-3.5 w-3.5 text-blue-500" />
                      Twitter/X integration
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Voiceover Studio */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-in fade-in slide-in-from-right delay-400 group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Mic className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>AI Voiceover Studio</CardTitle>
                    <CardDescription>
                      Professional voiceovers in multiple languages
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>50+ AI voices</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Multiple languages</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Studio quality output</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Scheduler */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Smart Scheduler</CardTitle>
                    <CardDescription>
                      Plan your content calendar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Cross-platform scheduling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Optimal timing suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Content calendar view</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Dashboard */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <BarChart3 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Analytics Dashboard</CardTitle>
                    <CardDescription>Track performance metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Real-time engagement tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Multi-platform insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Growth analytics</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trend Discovery */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Search className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle>Trend Discovery</CardTitle>
                    <CardDescription>
                      Discover trending topics across domains
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>20+ creative domains</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Trending hashtags & topics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Regional & global insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Centered Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
            {/* Reel Creator */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Palette className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle>Reel Creator</CardTitle>
                    <CardDescription>Poetry & video reels</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Poem to reel conversion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>AI-powered editing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Multiple creative modes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>AI Assistant</CardTitle>
                    <CardDescription>Smart content suggestions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Content idea generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Optimal posting times</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Strategy recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30 animate-in fade-in slide-in-from-bottom duration-500"
      >
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom px-4">
              How it works
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom duration-700 px-4">
              Get started with ContentHub in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center animate-in fade-in slide-in-from-left duration-500 hover:scale-105 transition-transform px-4">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 hover:bg-primary/20 transition-colors">
                <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                1. Choose Your Goal
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Select what type of content you want to create - videos, posts,
                voiceovers, or complete campaigns.
              </p>
            </div>

            <div className="text-center animate-in fade-in slide-in-from-bottom duration-700 hover:scale-105 transition-transform px-4">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 hover:bg-primary/20 transition-colors">
                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">2. Let AI Create</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Our AI tools generate high-quality content based on your inputs,
                preferences, and brand guidelines.
              </p>
            </div>

            <div className="text-center animate-in fade-in slide-in-from-right duration-500 hover:scale-105 transition-transform px-4 sm:col-span-2 md:col-span-1">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">3. Publish & Grow</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Schedule and publish your content across platforms, then track
                performance with detailed analytics.
              </p>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 text-center px-4">
            <SignedOut>
              <Link href="/sign-in" className="inline-block w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 animate-in fade-in slide-in-from-bottom duration-500">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">10K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground px-2">
                Active Creators
              </div>
            </div>
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">1M+</div>
              <div className="text-xs sm:text-sm text-muted-foreground px-2">
                Content Pieces Created
              </div>
            </div>
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">50+</div>
              <div className="text-xs sm:text-sm text-muted-foreground px-2">
                Countries Served
              </div>
            </div>
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground px-2">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground animate-in fade-in slide-in-from-bottom duration-700">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom px-4">
              Ready to transform your content creation?
            </h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-primary-foreground/80 animate-in fade-in slide-in-from-bottom duration-500 px-4">
              Join thousands of creators who are already using ContentHub to
              grow their audience and streamline their workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <SignedOut>
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </SignedIn>
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 border-0"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-primary flex items-center justify-center">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm sm:text-base">ContentHub</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                AI-powered content creation platform for modern creators.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-6 sm:my-8" />

          <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-muted-foreground gap-3 sm:gap-0">
            <p className="text-center sm:text-left">&copy; 2025 ContentHub. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

