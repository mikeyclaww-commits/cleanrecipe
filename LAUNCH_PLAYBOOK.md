# CleanRecipe Launch Playbook

## Phase 5: Launch & Distribution Plan

### Organic Launch Channels (Top 3)

#### 1. Reddit (Primary — Week 1)

**Target Subreddits:**
- r/Cooking (6M subscribers) — "I built a free tool that strips all the bloat from recipe websites"
- r/MealPrepSunday (4M) — "Paste any recipe URL, get just the ingredients + steps. Free tool."
- r/EatCheapAndHealthy (5M) — "I got tired of scrolling past life stories to find recipes, so I built this"
- r/Baking (1.5M) — "Clean recipe extraction tool — no more ads and pop-ups"
- r/slowcooking (2M) — targeting crockpot recipe URLs specifically

**Post Template:**
```
Title: I got tired of scrolling through 3,000-word life stories to find a recipe, so I built a tool that strips it all away

Body:
Hey everyone — I'm a home cook who got fed up with recipe websites. 
You know the ones: 47 paragraphs about how this chicken reminded them 
of their grandmother's summer in Tuscany, then finally the recipe at 
the bottom buried under 12 ads.

So I built CleanRecipe. Paste any recipe URL → get just the recipe 
in 2 seconds. Title, ingredients, steps, times. That's it.

- Works with almost any food blog (AllRecipes, Food Network, random blogs, etc.)
- Free to use — no signup needed to try it
- Save up to 15 recipes free, scale servings, make grocery lists

Try it: [link]

Would love feedback from actual home cooks. What sites should I make 
sure it works with?
```

#### 2. TikTok / Instagram Reels (Week 2)

**Video Concept (15-30 seconds):**
1. Screen recording: Open a bloated recipe page, scroll past endless text
2. Copy URL
3. Paste into CleanRecipe
4. Show the clean result — "That's it. Just the recipe."
5. Text overlay: "Free tool — link in bio"

**Target hashtags:** #cookingtips #recipehack #foodhack #mealprep #homecook

#### 3. Product Hunt Launch (Week 3)

**Launch Prep:**
- Screenshots: Landing page, extraction demo, dashboard, grocery list
- Maker comment: Story about recipe website frustration
- Tagline: "Paste any recipe URL, get just the recipe"
- Schedule: Tuesday or Wednesday at midnight PT

### Launch Week KPIs

| Metric | Target |
|--------|--------|
| Landing page visitors | 2,000+ |
| Signup conversion | ≥5% (100+ signups) |
| Activation (first recipe saved) | ≥60% of signups |
| Free-to-paid conversion | ≥2% in month 1 |
| Day-1 retention | ≥40% |

---

## Phase 6: Revenue Projection

### Assumptions
- Average conversion rate: 3% free-to-paid
- Average revenue per paid user: $4.99/mo (assume 60% monthly, 40% annual)
- Blended ARPU for paid: ~$4.16/mo (accounting for annual discount)
- Churn rate: 8%/month for monthly, 30%/year for annual
- Organic growth from Reddit + word of mouth

### Month 1-6 Projection (Conservative)

| Month | New Users | Total Users | Paid Users | MRR |
|-------|-----------|-------------|------------|-----|
| 1 | 500 | 500 | 15 | $62 |
| 2 | 400 | 850 | 35 | $146 |
| 3 | 600 | 1,350 | 60 | $250 |
| 4 | 800 | 2,000 | 95 | $395 |
| 5 | 1,000 | 2,800 | 140 | $582 |
| 6 | 1,200 | 3,700 | 200 | $832 |

**6-Month Total Revenue:** ~$2,267
**12-Month Projection (if growth continues):** $15,000-25,000 ARR

### Path to $10K MRR
- Need ~2,400 paid users at $4.16 blended ARPU
- At 3% conversion, need ~80,000 total users
- Achievable in 12-18 months with consistent content marketing + SEO + viral TikTok content

### Cost Structure
- Anthropic API: ~$0.002-0.01 per extraction (Haiku is cheap)
- Vercel hosting: Free tier initially, ~$20/mo at scale
- Supabase: Free tier initially, ~$25/mo at scale
- Domain: ~$12/year
- **Break-even: ~$50/mo = 12 paid users**

---

## Deployment Checklist

### Immediate (Today)
- [x] Build MVP (landing page + extraction + dashboard + grocery list)
- [x] Test AI extraction on real recipe sites
- [x] Git repo initialized
- [ ] Push to GitHub (needs PAT)
- [ ] Deploy to Vercel
- [ ] Set up custom domain

### Week 1
- [ ] Set up Supabase (auth + database for persistence)
- [ ] Set up Stripe (payments)
- [ ] Add PostHog analytics
- [ ] Set up Resend for transactional emails
- [ ] Reddit launch posts (3-5 subreddits)

### Week 2
- [ ] Create TikTok/Reels demo video
- [ ] Write 3 SEO blog posts:
  1. "How to Save Recipes Without the Bloat"
  2. "The Best Recipe Manager Apps in 2026 (Compared)"
  3. "Why Recipe Websites Have So Much Text (And How to Skip It)"
- [ ] Submit to Product Hunt

### Week 3
- [ ] Analyze first 2 weeks of data
- [ ] Iterate based on user feedback
- [ ] Add top-requested features
- [ ] Expand to more recipe sites
