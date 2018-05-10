# psm-dashboard

Dashboard code for displaying [PSM](http://projectpsm.org/) project status.

Like the PSM itself, this dashboard is [open source](LICENSE) software.

Much of this depends on the [PSM requirements](https://github.com/SolutionGuidance/psm/tree/master/requirements]),
so take a look there if you're missing context for things here.

## What's here.

* `get-inputs`
  Script that gathers data from various PSM project sources
  (high-level features list, requirements list, issue tracker) and
  turns it into JSON which is then used as input to the dashboard
  display code.  See the "Data format" section in this document for
  details.

* `sample-input.json`
  Sample input for the dashboard display code (i.e., output from a
  single run of `get-inputs`).

* `non-hidden-RTM-rows.org`
  An initial export of PSM requirements to Org Mode format (done manually,
  I believe, rather than from the CSV files).  This export turned out
  to be missing some hidden rows; see the next entry about that.

* `hidden-RTM-rows.org`
  The remainder of the Org Mode export (see above).  Here's how you
  know that this file and non-hidden-RTM-rows.org have different reqs:

          $ grep -E "^\* psm-" hidden-RTM-rows.org | cut -c 3- > hidden-reqs
          $ grep -E "^\* psm-" non-hidden-RTM-rows.org | cut -c 3- > non-hidden-reqs
          $ sort hidden-reqs > h.tmp; mv h.tmp hidden-reqs
          $ sort non-hidden-reqs > n.tmp; mv n.tmp non-hidden-reqs
          $ comm -1 -2 hidden-reqs non-hidden-reqs
          $ diff -u hidden-reqs non-hidden-reqs
          $ rm hidden-reqs non-hidden-reqs

* `added-reqs.org`
  Requirements we created during the first issues/reqs sweep, which
  used only the non-hidden rows, as we didn't know about the hidden
  rows at the time.  Therefore, some of the newly created reqs in
  added-reqs.orq are redundant with existing reqs; there is more
  detail about this in the file.  Others are not redundant -- they
  represent genuinely new requirements that we came up with during
  our requirements sweep.  All of the added reqs are, I believe, also
  present in non-hidden-RTM-rows.org, since the added reqs were
  created during the initial issues/reqs sweep.

  What we should do with redundant new reqs now:

  Once we're sure we've identified every one of them, we should make
  sure none of them are attached to any issues, and then remove all
  the redundant reqs from any file that has them (RTM.xlsx in the PSM
  repository, added-reqs.org here, and *-RTM-rows.org here too just to
  be safe).

  What we should do with non-redundant new reqs now:

  They should stay, of course, but note that the removal of some of
  the redundant ones might lead to the downward renumbering of some
  non-redundant ones.

* `issues-2018-03-31.org`
  An export of all issues and their labels, up to issue 740, plus some
  information about which issues should get which req-related labels.

  The information in this file was converted to JSON and fed to
  ots-tools/github-tools/gh-sak, to put req labels on our issues.
  Those JSON files are still around on the PSM repository's archival
  rtm-issue-linking branch, but we haven't preserved them here.

## Data format

This is the JSON data input format that the dashboard expects:

      "features": {
        "psm-feature-000": {
          "description": String,
          "status": String ["Complete", "InProgress", "NotStarted"],
          "startDate": String[Date] or null,
          "completedDate": String[Date] or null,
          "requirements": [
            "psm-FR-8.2", 
            "psm-FR-8.3", 
            ...
          ]
        },
        "psm-feature-001": {
          ...
        }
      }
      

      "requirements": {
        "psm-FR-8.2": {
          "description": String,
          "status": String ["Complete", "InProgress", "NotStarted"],
          "startDate": String[Date] or null,
          "completedDate": String[Date] or null,
          "issues": [
            123,
            456,
            789,
            ...
          ]
        },
        "psm-FR-8.3": {
          ...
        },
        ...
      }


      "issues": {
        "123": {
          "title": String,
          "description": String,
          "url": String,
          "status": String ["Complete", "InProgress", "NotStarted"],
          "startDate": String[Date] or null,
          "completedDate": String[Date] or null,
        },
        "456": {
          ...
        },
        ...
      }

Fields without values (e.g. startDate, or completedDate) should be
`null` which is JSON's way of representing absence of a value:

      {
        "startDate": null
      }

And dates should be represented as strings in ISO 8601 format
(https://www.w3.org/TR/NOTE-datetime) which can readily be converted into JS
Date objects if needed:

      {
        "startDate": "2018-06-11"
      }

Minimum precision for dates should be the day (as above), but hours and minutes
can also optionally be included:

      {
        "startDate": "2018-06-11T19:20+01:00"
      }
