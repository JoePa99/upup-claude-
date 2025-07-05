# AI Context Builder

An intelligent context generation tool that transforms business intelligence into optimized AI prompts for better customer interactions.

## 🚀 Features

### Intelligent Context Generation
- **Smart Customer Segmentation**: Choose from pre-built personas with deep demographic and psychographic profiles
- **Dynamic Pain Point Prioritization**: Drag-and-drop interface to rank customer challenges with real-time impact preview
- **Voice Optimization**: Automatically calculates optimal communication voice based on segment and situation
- **Real-time Quality Metrics**: Live feedback on context completeness, specificity, and differentiation

### Advanced Form System
- **Cascading Logic**: Form fields intelligently update based on previous selections
- **Progressive Disclosure**: Complex functionality revealed gradually to avoid overwhelm
- **Live Preview**: See generated context update in real-time as you build
- **Quality Scoring**: Comprehensive metrics with actionable optimization suggestions

### Context Engine
- **Relationship Rules**: Sophisticated decision trees map customer attributes to optimal messaging
- **Situational Modifiers**: Context adapts based on urgency, competitive pressure, and relationship stage
- **Proof Point Prioritization**: Automatically ranks supporting evidence based on customer needs
- **Channel Optimization**: Recommends best communication channels and timing

## 🏗️ Architecture

### Core Components

#### `/src/types/ontology.ts`
Comprehensive TypeScript definitions for business intelligence data structures including customer segments, pain points, voice attributes, and relationship rules.

#### `/src/lib/contextEngine.ts`
The core intelligence engine that processes form inputs through sophisticated decision trees to generate optimized AI context.

#### `/src/data/ontology.json`
Rich business intelligence data including:
- Customer segment profiles (Independent Sponsors, Legacy Founders)
- Pain point hierarchies with severity and frequency
- Voice attributes with communication guidelines
- Journey stage mapping
- Relationship rules for context optimization

#### Key React Components
- **`SmartSegmentPicker`**: Intelligent customer segment selection with fit scoring
- **`DragDropPainPointRanker`**: Interactive pain point prioritization with weight adjustment
- **`ContextPreview`**: Live context generation with quality metrics and optimization suggestions
- **`ContextBuilderForm`**: Master form controller with step progression and state management

## 🎯 Business Intelligence

### Customer Segments
- **Independent Sponsors**: Solo entrepreneurs acquiring companies without permanent capital
- **Legacy Founders**: Baby boomer business owners planning succession or exit

### Voice Attributes
- **Trustworthy**: Steadfast partner who delivers (reduces anxiety, builds confidence)
- **Empathetic**: Partner who listens and cares (feeling understood and valued)
- **Experienced**: Seasoned guide with practical wisdom (confidence in guidance)
- **Empowering**: Catalyst that unlocks potential (feeling capable and supported)

### Pain Points
- **Capital Raising Friction**: Difficulty securing deal financing (High severity, every deal)
- **No Margin for Error**: Single deal failure = 6-12 months zero return (Extreme severity)
- **Bandwidth Limitations**: One person handling everything (High severity, constant)
- **Legacy Preservation**: Ensuring business continuity (High severity for founders)

## 🔧 Technical Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Form Management**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **State Management**: React hooks with optimistic updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📊 Context Quality Metrics

The system evaluates generated context across four dimensions:

1. **Completeness** (30% weight): How much relevant context information is provided
2. **Specificity** (25% weight): How personalized and targeted the context is
3. **Differentiation** (25% weight): How well positioned against competitive alternatives
4. **Voice Alignment** (20% weight): How well the voice matches the situation and segment

### Quality Thresholds
- **80%+**: Excellent context ready for immediate use
- **60-79%**: Good context with minor optimization opportunities
- **<60%**: Needs improvement before use

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Trust, reliability, intelligence
- **Secondary**: Gray (#6b7280) - Professional, balanced
- **Success**: Green (#10b981) - Positive outcomes, completion
- **Warning**: Yellow (#f59e0b) - Attention, optimization needed
- **Error**: Red (#ef4444) - Critical issues, high severity

## 🔮 Future Enhancements

### Phase 1: Core Intelligence (Complete)
- ✅ Ontology structure and relationship mapping
- ✅ Context generation engine
- ✅ Dynamic form system with cascading logic
- ✅ Real-time preview and quality metrics

### Phase 2: Advanced Features (Next)
- 🔄 API endpoints for context generation
- 🔄 User authentication and session management
- 🔄 Context saving and loading
- 🔄 A/B testing for context effectiveness

### Phase 3: AI Integration
- 🔄 OpenAI/Anthropic API integration
- 🔄 Real-time AI response testing
- 🔄 Context optimization based on AI output quality
- 🔄 Performance analytics and improvement suggestions

### Phase 4: Scale & Enterprise
- 🔄 Multi-tenant architecture
- 🔄 Custom ontology creation
- 🔄 Team collaboration features
- 🔄 Advanced analytics and reporting

## 📈 Success Metrics

### User Experience Goals
- Context building completed in under 5 minutes
- 80%+ suggestion relevance rate
- Sub-500ms context generation time
- 85%+ user satisfaction with generated context

### Business Impact Goals
- Measurably better AI response quality
- Reduced time to create effective prompts
- Higher customer engagement rates
- Improved sales/marketing conversion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Ready to build better AI interactions?** Start by selecting your customer segment and watch the magic happen! 🚀
